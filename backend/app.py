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

# --- In-Memory Session Storage (The "Brain's" Memory) ---
interview_sessions: Dict[str, Dict[str, Any]] = {}

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
    difficulty: str

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
    Takes a resume and a job description,
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

@app.post("/start_interview")
async def start_interview_endpoint(
    difficulty: str = Form(...),
    num_questions: int = Form(...),
    file: UploadFile = File(...)
):
    """
    Takes PDF + settings, creates a session,
    and returns the *first* question.
    """
    if not stt_model: 
        raise HTTPException(status_code=500, detail="Server models are not ready.")

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
        
        parsed_data = parse_resume(text=resume_text)
        
        question_list = generate_question_list(
            parsed_data.get("skills", []),
            parsed_data.get("experience", []),
            difficulty,
            num_questions
        )
        if not question_list:
            raise HTTPException(status_code=500, detail="Failed to generate questions")

        # Generate audio for *only the first question* to save time
        first_question_text = question_list[0]
        first_question_audio_b64 = generate_audio_b64(first_question_text)

        # Create and save the session
        session_id = str(uuid.uuid4())
        interview_sessions[session_id] = {
            "resume_data": parsed_data,
            "question_list": question_list,     # The *full* list
            "turn_count": 0,                # Starts at 0
            "conversation_history": []
        }

        # Return the session ID and the first question
        return {
            "session_id": session_id,
            "question_text": first_question_text,
            "question_audio_b64": first_question_audio_b64,
            "resume_data": parsed_data,
            "total_questions": len(question_list)
        }
    
    except Exception as e:
        if 'tmp_path' in locals() and os.path.exists(tmp_path): 
            os.remove(tmp_path)
        print(f"Error in /start_interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/submit_turn")
async def submit_turn_endpoint(
    session_id: str = Form(...),
    cv_scores_json: str = Form(...), 
    audio_file: UploadFile = File(...)
):
    """
    This is the main "brain" loop.
    It analyzes the user's answer and decides what to do next.
    """
    if not stt_model or not judgment_model:
        raise HTTPException(status_code=500, detail="Server models are not ready.")
    
    if session_id not in interview_sessions:
        raise HTTPException(status_code=404, detail="Invalid session ID")
    
    session = interview_sessions[session_id]
    tmp_path = ""

    try:
        # --- 1. Get all data for this turn ---
        current_question_text = session["question_list"][session["turn_count"]]
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            contents = await audio_file.read()
            tmp.write(contents)
            tmp_path = tmp.name
            
        result = stt_model.transcribe(tmp_path, fp16=False)
        user_answer_text = result["text"]
        if not user_answer_text: user_answer_text = "(No speech detected)"
        
        cv_scores_list = json.loads(cv_scores_json)
        avg_posture = np.mean([s[0] for s in cv_scores_list]) if cv_scores_list else 0.5
        avg_eye_contact_pct = np.mean([1 if s[1] else 0 for s in cv_scores_list]) if cv_scores_list else 0.5
        total_blinks = np.sum([1 for s in cv_scores_list if s[2]]) if cv_scores_list else 0
        
        audio_data, sample_rate = sf.read(tmp_path, dtype='float32')
        if audio_data.ndim > 1: audio_data = audio_data.mean(axis=1)
        if sample_rate != 22050:
            audio_data = librosa.resample(audio_data, orig_sr=sample_rate, target_sr=22050)
            sample_rate = 22050
        audio_scores = analyze_audio_features(audio_data, sample_rate)
        
        content_score = evaluate_answer(current_question_text, user_answer_text)
        
        os.remove(tmp_path)

        # --- 2. Save this turn's data to the session ---
        session["conversation_history"].append({
            "question": current_question_text,
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
        session["turn_count"] += 1
        
        # --- 3. Decide what to do next ---
        if session["turn_count"] >= len(session["question_list"]):
            # --- INTERVIEW ENDS ---
            final_report = _generate_final_report(session["conversation_history"])
            del interview_sessions[session_id] # Clean up session
            return {
                "status": "COMPLETE",
                "final_report": final_report,
                "full_conversation": session["conversation_history"]
            }
        else:
            # --- INTERVIEW CONTINUES ---
            new_question_text = session["question_list"][session["turn_count"]]
            new_question_audio_b64 = generate_audio_b64(new_question_text)
            
            return {
                "status": "CONTINUE",
                "next_question_text": new_question_text,
                "next_question_audio_b64": new_question_audio_b64
            }

    except Exception as e:
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
             os.remove(tmp_path)
        if session_id in interview_sessions:
            del interview_sessions[session_id] # Clean up on error
        print(f"Error in /submit_turn: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- FEATURE 3: AI CODE REVIEW ---
@app.post("/generate_coding_problem")
def generate_coding_problem_endpoint(request: CodingProblemRequest):
    try:
        problem_json = get_coding_problem(request.skills, request.difficulty)
        return problem_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate_code")
def evaluate_code_endpoint(request: CodeEvaluationRequest):
    try:
        review_text = evaluate_code_solution(request.problem_description, request.user_code)
        return {"review_text": review_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- (Utility endpoint) ---
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

# --- (Utility endpoint) ---
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
        
        parsed_data = parse_resume(pdf_path=tmp_path)
        os.remove(tmp_path)
        return parsed_data
        
    except Exception as e:
        if os.path.exists(tmp_path): os.remove(tmp_path)
        print(f"Error in /parse_resume: {e}")
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {e}")