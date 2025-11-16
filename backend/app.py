import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import uuid
import json

import numpy as np
import os
import tempfile
import cv2
import mediapipe as mp
import soundfile as sf
import librosa
from gtts import gTTS
from io import BytesIO
import base64
import whisper
import joblib

# --- Import all your ML helper functions ---
from backend.ollama_client import (
    evaluate_answer, 
    generate_question_list,
    get_coding_problem,
    evaluate_code_solution,
    analyze_resume_against_job 
)
from ml.cv.eye_tracking import get_head_pose, is_looking_at_camera, is_blinking
from ml.cv.posture_analysis import calculate_posture_score
from ml.audio.emotion_detector import analyze_audio_features
# This import is CRITICAL and must have both functions
from ml.nlp.resume_parser import extract_text_from_pdf, parse_resume 

app = FastAPI()

# --- Enable CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# --- (No Session Storage, we are stateless) ---

# --- Initialize ALL Models at Startup ---
try:
    # CV Models
    face_mesh = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=False, max_num_faces=1, refine_landmarks=True,
        min_detection_confidence=0.5, min_tracking_confidence=0.5,
    )
    pose = mp.solutions.pose.Pose(
        static_image_mode=False, model_complexity=1, smooth_landmarks=True,
        min_detection_confidence=0.5, min_tracking_confidence=0.5,
    )
    print("MediaPipe models loaded successfully.")
    
    # STT Model
    stt_model = whisper.load_model("base")
    print("Whisper STT model loaded successfully.")
    
    # Custom "Judgment" Model
    JUDGMENT_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'judgment_model.joblib')
    if not os.path.exists(JUDGMENT_MODEL_PATH):
        print(f"Warning: '{JUDGMENT_MODEL_PATH}' not found. Did you run the training script?")
        judgment_model = None
    else:
        judgment_model = joblib.load(JUDGMENT_MODEL_PATH)
        print("Custom 'Nervousness' Judgment Model loaded successfully.")

except Exception as e:
    print(f"CRITICAL ERROR: Could not load ML models: {e}")
    face_mesh = None
    pose = None
    stt_model = None
    judgment_model = None

# --- Internal Helper Functions (Brain Logic) ---

def generate_audio_b64(text: str) -> str:
    """Generates speech from text and returns it as a base64 encoded string."""
    try:
        audio_bytes = BytesIO()
        tts = gTTS(text=text, lang='en', slow=False)
        tts.write_to_fp(audio_bytes)
        audio_bytes.seek(0)
        b64_string = base64.b64encode(audio_bytes.read()).decode('utf-8')
        return b64_string
    except Exception as e:
        print(f"Error generating TTS: {e}")
        return ""

def _generate_final_report(conversation_history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Internal function to calculate the final report from the history.
    """
    if not conversation_history or not judgment_model:
        return {"error": "Model not loaded or no history"} 

    # 1. Average all scores
    avg_content = np.mean([turn["scores"]["content_score"] for turn in conversation_history])
    avg_confidence = np.mean([turn["scores"]["audio_confidence"] for turn in conversation_history])
    avg_fluency = np.mean([turn["scores"]["audio_fluency"] for turn in conversation_history])
    avg_posture = np.mean([turn["scores"]["avg_posture"] for turn in conversation_history])
    avg_eye_contact = np.mean([turn["scores"]["eye_contact_percentage"] for turn in conversation_history])
    avg_blinks = np.mean([turn["scores"]["total_blinks"] for turn in conversation_history])
    avg_audio_nervousness = np.mean([turn["scores"]["audio_nervousness"] for turn in conversation_history])

    # 2. Use Our REAL AI "Judgment" Model
    features = [[avg_blinks, avg_audio_nervousness, avg_posture]]
    overall_nervousness_score = judgment_model.predict(features)[0]

    # 3. Calculate Final Weighted Score
    technical_score = avg_content
    communication = (avg_fluency + (1 - overall_nervousness_score)) / 2 # use inverse
    body_language = avg_posture
    eye_contact = avg_eye_contact
    tone_confidence = avg_confidence
    final_score = (0.45 * technical_score) + (0.20 * communication) + (0.15 * body_language) + (0.10 * eye_contact) + (0.10 * tone_confidence)

    # 4. Build the report object
    return {
        "final_score_percentage": final_score * 100,
        "avg_content_score": avg_content,
        "avg_audio_confidence": avg_confidence,
        "avg_fluency": avg_fluency,
        "avg_posture": avg_posture,
        "avg_eye_contact_percentage": avg_eye_contact,
        "overall_nervousness_score": float(overall_nervousness_score),
        "avg_blinks_per_answer": avg_blinks
    }

# --- Request Models ---
class CodeEvaluationRequest(BaseModel):
    problem_description: str
    user_code: str

class CodingProblemRequest(BaseModel):
    skills: List[str]
    difficulty: str # "easy", "medium", or "hard"

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "AI Mock Interview Backend is running"}

# --- FEATURE 1: AI RESUME SCORING ---
@app.post("/score_resume")
async def score_resume_endpoint(
    job_description: str = Form(...),
    file: UploadFile = File(...)   # resume.pdf
):
    """
    This endpoint takes a resume and a job description,
    and returns the "AI Hiring Manager" analysis.
    """
    tmp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        resume_text = extract_text_from_pdf(tmp_path)
        os.remove(tmp_path)
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not read text from PDF.")

        resume_analysis = analyze_resume_against_job(resume_text, job_description)
        return resume_analysis
    
    except Exception as e:
        if 'tmp_path' in locals() and os.path.exists(tmp_path): 
            os.remove(tmp_path)
        print(f"Error in /score_resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- FEATURE 2: AI MOCK INTERVIEW ---
@app.post("/generate_interview_plan")
async def generate_interview_plan_endpoint(
    difficulty: str = Form(...),
    num_questions: int = Form(...),
    file: UploadFile = File(...)
):
    """
    Takes a PDF resume and user prefs, and returns a
    full list of questions and their audio.
    """
    tmp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        resume_text = extract_text_from_pdf(tmp_path) # Just get text
        os.remove(tmp_path)
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not read text from PDF.")
        
        # We need the skills from the resume
        parsed_data = parse_resume(text=resume_text) # Use our parser
        
        # Generate List of Question Strings
        question_list = generate_question_list(
            parsed_data.get("skills", []),
            parsed_data.get("experience", []),
            difficulty,
            num_questions
        )
        if not question_list:
            raise HTTPException(status_code=500, detail="Failed to generate questions")

        # Generate Audio for *each* question
        interview_plan = []
        for q_text in question_list:
            q_audio_b64 = generate_audio_b64(q_text)
            interview_plan.append({
                "question_text": q_text,
                "question_audio_b64": q_audio_b64
            })

        # Return the full plan
        return {
            "resume_data": parsed_data, # Send back the parsed skills
            "interview_plan": interview_plan
        }
    
    except Exception as e:
        if 'tmp_path' in locals() and os.path.exists(tmp_path): 
            os.remove(tmp_path)
        print(f"Error in /generate_interview_plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit_full_interview")
async def submit_full_interview_endpoint(
    turn_data_json: str = Form(...), 
    files: List[UploadFile] = File(...)
):
    """
    This is the "brain" that receives all data at the end,
    runs all analysis, and returns the final report.
    """
    if not stt_model or not judgment_model:
        raise HTTPException(status_code=500, detail="Server models are not ready.")
    
    try:
        turn_data_list = json.loads(turn_data_json)
        file_map = {f.filename: f for f in files}
        conversation_history = []
        
        for turn in turn_data_list:
            question_text = turn.get("question_text")
            audio_file_key = turn.get("audio_file_key")
            cv_scores_key = turn.get("cv_scores_key")
            
            audio_file = file_map.get(audio_file_key)
            cv_scores_file = file_map.get(cv_scores_key)
            
            if not all([question_text, audio_file, cv_scores_file]):
                raise HTTPException(status_code=400, detail="Missing data for a turn")

            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                contents = await audio_file.read()
                tmp.write(contents)
                audio_tmp_path = tmp.name
            
            result = stt_model.transcribe(audio_tmp_path, fp16=False)
            user_answer_text = result["text"]
            if not user_answer_text: user_answer_text = "(No speech detected)"
            
            cv_scores_contents = await cv_scores_file.read()
            cv_scores_list = json.loads(cv_scores_contents.decode('utf-8'))
            avg_posture = np.mean([s[0] for s in cv_scores_list]) if cv_scores_list else 0.5
            avg_eye_contact_pct = np.mean([1 if s[1] else 0 for s in cv_scores_list]) if cv_scores_list else 0.5
            total_blinks = np.sum([1 for s in cv_scores_list if s[2]]) if cv_scores_list else 0
            
            audio_data, sample_rate = sf.read(audio_tmp_path, dtype='float32')
            if audio_data.ndim > 1: audio_data = audio_data.mean(axis=1)
            if sample_rate != 22050:
                audio_data = librosa.resample(audio_data, orig_sr=sample_rate, target_sr=22050)
                sample_rate = 22050
            audio_scores = analyze_audio_features(audio_data, sample_rate)
            
            content_score = evaluate_answer(question_text, user_answer_text)
            
            os.remove(audio_tmp_path)

            conversation_history.append({
                "question": question_text,
                "answer": user_answer_text,
                "scores": {
                    "content_score": content_score,
                    "audio_confidence": audio_scores.get("confidence", 0.0),
                    "audio_nervousness": audio_scores.get("nervousness", 0.0),
                    "audio_fluency": audio_scores.get("fluency", 0.0),
                    "avg_posture": avg_posture,
                    "eye_contact_percentage": avg_eye_contact_pct,
                    "total_blinks": total_blinks 
                }
            })

        final_report = _generate_final_report(conversation_history)
        
        return {
            "status": "COMPLETE",
            "final_report": final_report,
            "full_conversation": conversation_history
        }

    except Exception as e:
        if 'audio_tmp_path' in locals() and os.path.exists(audio_tmp_path):
             os.remove(audio_tmp_path)
        print(f"Error in /submit_full_interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- (Utility endpoint for CV) ---
@app.post("/analyze_frame")
async def analyze_frame_endpoint(file: UploadFile = File(...)):
    if not face_mesh or not pose:
        raise HTTPException(status_code=500, detail="MediaPipe models not loaded")
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pose_results = pose.process(rgb_frame)
        face_results = face_mesh.process(rgb_frame)
        
        posture_score = 0.5
        eye_contact = False
        blink_detected = False
        
        if pose_results.pose_landmarks:
            posture_score = calculate_posture_score(pose_results.pose_landmarks.landmark)

        if face_results.multi_face_landmarks:
            landmarks = face_results.multi_face_landmarks[0].landmark
            y_angle, x_angle, _, _ = get_head_pose(frame, landmarks)
            eye_contact = is_looking_at_camera(x_angle, y_angle)
            blink_detected = is_blinking(landmarks, frame.shape)
            
        return {
            "posture_score": posture_score,
            "eye_contact": eye_contact,
            "blink_detected": blink_detected
        }
    except Exception as e:
        return {"posture_score": 0.5, "eye_contact": False, "blink_detected": False}

# --- (THIS IS THE FIX) ---
# --- ADDING THIS UTILITY ENDPOINT BACK ---
@app.post("/parse_resume")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """
    Parses a resume and returns the extracted skills/exp.
    Used by the Coding Challenge feature.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type.")
    tmp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        
        # Call the full parser from our NLP module
        parsed_data = parse_resume(pdf_path=tmp_path)
        os.remove(tmp_path)
        return parsed_data
        
    except Exception as e:
        if os.path.exists(tmp_path): os.remove(tmp_path)
        print(f"Error in /parse_resume: {e}")
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {e}")

# --- FEATURE 3: AI CODE REVIEW ---
@app.post("/generate_coding_problem")
def generate_coding_problem_endpoint(request: CodingProblemRequest):
    """
    Generates a coding problem based on the user's skills AND difficulty.
    """
    try:
        problem_json = get_coding_problem(request.skills, request.difficulty)
        return problem_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate_code")
def evaluate_code_endpoint(request: CodeEvaluationRequest):
    """
    Evaluates a user's text-based code solution.
    """
    try:
        review_text = evaluate_code_solution(request.problem_description, request.user_code)
        return {"review_text": review_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))