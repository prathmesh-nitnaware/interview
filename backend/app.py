import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
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
from datetime import datetime

# --- Database & Security ---
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# --- Import Custom Modules ---
# Make sure these files exist in your project structure
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

# --- 1. Database Setup ---
# Default to local Mongo. For Atlas, paste your connection string here.
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ai_mock_interview_db
users_collection = db.users
interviews_collection = db.interviews
consultations_collection = db.consultations

# --- 2. Security Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- 3. Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# --- 4. ML Model Initialization ---
try:
    print("Loading ML models...")
    face_mesh = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=False, max_num_faces=1, refine_landmarks=True,
        min_detection_confidence=0.5, min_tracking_confidence=0.5
    )
    pose = mp.solutions.pose.Pose(
        static_image_mode=False, model_complexity=1, smooth_landmarks=True
    )
    stt_model = whisper.load_model("base")
    
    JUDGMENT_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'judgment_model.joblib')
    if os.path.exists(JUDGMENT_MODEL_PATH):
        judgment_model = joblib.load(JUDGMENT_MODEL_PATH)
        print("Judgment Model loaded.")
    else:
        judgment_model = None
        print("Warning: Judgment model not found. Using heuristics.")
    
    print("All models loaded successfully.")
except Exception as e:
    print(f"CRITICAL ERROR loading models: {e}")
    face_mesh = pose = stt_model = judgment_model = None

# --- Data Models ---
class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class CodeEvaluationRequest(BaseModel):
    problem_description: str
    user_code: str

class CodingProblemRequest(BaseModel):
    skills: List[str]
    difficulty: str 

# --- Helper Functions ---
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def generate_audio_b64(text: str) -> str:
    try:
        audio_bytes = BytesIO()
        tts = gTTS(text=text, lang='en', slow=False)
        tts.write_to_fp(audio_bytes)
        audio_bytes.seek(0)
        return base64.b64encode(audio_bytes.read()).decode('utf-8')
    except:
        return ""

def _generate_final_report(conversation_history: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not conversation_history:
        return {}
        
    # Extract raw metrics
    avg_content = np.mean([turn["scores"]["content_score"] for turn in conversation_history])
    avg_confidence = np.mean([turn["scores"]["audio_confidence"] for turn in conversation_history])
    avg_fluency = np.mean([turn["scores"]["audio_fluency"] for turn in conversation_history])
    avg_posture = np.mean([turn["scores"]["avg_posture"] for turn in conversation_history])
    avg_eye_contact = np.mean([turn["scores"]["eye_contact_percentage"] for turn in conversation_history])
    avg_blinks = np.mean([turn["scores"]["total_blinks"] for turn in conversation_history])
    avg_audio_nervousness = np.mean([turn["scores"]["audio_nervousness"] for turn in conversation_history])

    # Determine Nervousness
    overall_nervousness_score = 0.5
    if judgment_model:
        try:
            features = [[avg_blinks, avg_audio_nervousness, avg_posture]]
            overall_nervousness_score = judgment_model.predict(features)[0]
        except:
            pass

    # Calculate Weighted Score (0.0 to 1.0)
    # Technical: 45%, Comm: 20%, Body: 15%, Eye: 10%, Tone: 10%
    communication = (avg_fluency + (1 - overall_nervousness_score)) / 2
    final_score = (0.45 * avg_content) + (0.20 * communication) + (0.15 * avg_posture) + (0.10 * avg_eye_contact) + (0.10 * avg_confidence)

    return {
        "final_score_percentage": round(final_score * 100, 1),
        "avg_content_score": round(avg_content, 2),
        "avg_audio_confidence": round(avg_confidence, 2),
        "avg_fluency": round(avg_fluency, 2),
        "avg_posture": round(avg_posture, 2),
        "avg_eye_contact_percentage": round(avg_eye_contact, 2),
        "overall_nervousness_score": float(overall_nervousness_score),
        "avg_blinks_per_answer": round(avg_blinks, 1)
    }

# ==============================
#       AUTH ROUTES
# ==============================

@app.post("/signup")
async def signup(user: UserSignup):
    # 1. Check if user exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Create user document
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": get_password_hash(user.password),
        "created_at": datetime.utcnow()
    }
    
    # 3. Insert into DB
    await users_collection.insert_one(user_doc)
    
    # 4. Return success
    return {
        "message": "User created",
        "token": f"mock_jwt_token-{user_id}",
        "user": {"id": user_id, "name": user.name, "email": user.email}
    }

@app.post("/login")
async def login(user: UserLogin):
    # 1. Find user
    user_record = await users_collection.find_one({"email": user.email})
    if not user_record:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    # 2. Verify password
    if not verify_password(user.password, user_record["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # 3. Return success
    return {
        "message": "Login successful",
        "token": f"mock_jwt_token-{user_record['id']}",
        "user": {"id": user_record['id'], "name": user_record['name'], "email": user_record['email']}
    }

# ==============================
#    DASHBOARD & ANALYTICS
# ==============================

@app.get("/user_stats/{user_id}")
async def get_user_stats(user_id: str):
    """
    Aggregates data from the 'interviews' collection for the dashboard.
    """
    # Find interviews for this user, sort by date descending
    cursor = interviews_collection.find({"user_id": user_id}).sort("timestamp", -1)
    interviews = await cursor.to_list(length=50)
    
    count = len(interviews)
    if count == 0:
        return {"count": 0, "latestScore": 0, "averageScore": 0, "history": []}
        
    # Extract scores
    scores = [i.get("report", {}).get("final_score_percentage", 0) for i in interviews]
    latest_score = scores[0] if scores else 0
    average_score = sum(scores) / count if count > 0 else 0
    
    # Prepare graph history (reversed so oldest is first)
    history = []
    for i in reversed(interviews[:10]): # Last 10 sessions
        history.append({
            "date": i["timestamp"].strftime("%Y-%m-%d"),
            "score": i.get("report", {}).get("final_score_percentage", 0)
        })

    return {
        "count": count,
        "latestScore": latest_score,
        "averageScore": round(average_score, 1),
        "history": history
    }

@app.post("/book_consultation")
async def book_consultation(user_id: str = Form(...), topic: str = Form(...)):
    """
    Saves a consultation request to the database.
    """
    record = {
        "user_id": user_id,
        "topic": topic,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    await consultations_collection.insert_one(record)
    return {"message": "Request received", "id": str(record.get("_id"))}

# ==============================
#    CORE ML FEATURES
# ==============================

@app.post("/score_resume")
async def score_resume_endpoint(job_description: str = Form(...), file: UploadFile = File(...)):
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
        
        return analyze_resume_against_job(resume_text, job_description)
    except Exception as e:
        if os.path.exists(tmp_path): os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_interview_plan")
async def generate_interview_plan_endpoint(
    difficulty: str = Form(...),
    num_questions: int = Form(...),
    file: UploadFile = File(...)
):
    tmp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        
        resume_text = extract_text_from_pdf(tmp_path)
        os.remove(tmp_path)
        
        parsed_data = parse_resume(text=resume_text)
        question_list = generate_question_list(
            parsed_data.get("skills", []),
            parsed_data.get("experience", []),
            difficulty,
            num_questions
        )

        interview_plan = []
        for q_text in question_list:
            q_audio_b64 = generate_audio_b64(q_text)
            interview_plan.append({
                "question_text": q_text,
                "question_audio_b64": q_audio_b64
            })

        return {
            "resume_data": parsed_data,
            "interview_plan": interview_plan
        }
    except Exception as e:
        if os.path.exists(tmp_path): os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze_frame")
async def analyze_frame_endpoint(file: UploadFile = File(...)):
    if not face_mesh or not pose: 
        return {"posture_score": 0.5, "eye_contact": False, "blink_detected": False}
    try:
        nparr = np.frombuffer(await file.read(), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        p_res = pose.process(rgb)
        f_res = face_mesh.process(rgb)
        
        posture = 0.5
        eye = False
        blink = False
        
        if p_res.pose_landmarks:
            posture = calculate_posture_score(p_res.pose_landmarks.landmark)
        if f_res.multi_face_landmarks:
            lm = f_res.multi_face_landmarks[0].landmark
            y, x, _, _ = get_head_pose(frame, lm)
            eye = is_looking_at_camera(x, y)
            blink = is_blinking(lm, frame.shape)
            
        return {"posture_score": posture, "eye_contact": eye, "blink_detected": blink}
    except:
        return {"posture_score": 0.5}

@app.post("/submit_full_interview")
async def submit_full_interview_endpoint(
    turn_data_json: str = Form(...), 
    files: List[UploadFile] = File(...),
    user_id: str = Form(...) # Required for tracking
):
    if not stt_model:
        raise HTTPException(status_code=500, detail="STT model not loaded")
    
    try:
        turn_data_list = json.loads(turn_data_json)
        file_map = {f.filename: f for f in files}
        conversation_history = []
        
        for turn in turn_data_list:
            q_text = turn.get("question_text")
            audio_key = turn.get("audio_file_key")
            cv_key = turn.get("cv_scores_key")
            
            audio_file = file_map.get(audio_key)
            cv_file = file_map.get(cv_key)
            
            if not audio_file or not cv_file: continue

            # Process Audio
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                tmp.write(await audio_file.read())
                audio_path = tmp.name
            
            transcription = stt_model.transcribe(audio_path)["text"]
            
            # Process CV Data
            cv_data = json.loads((await cv_file.read()).decode('utf-8'))
            avg_posture = np.mean([x[0] for x in cv_data]) if cv_data else 0.5
            avg_eye = np.mean([1 if x[1] else 0 for x in cv_data]) if cv_data else 0.5
            blinks = sum([1 for x in cv_data if x[2]]) if cv_data else 0
            
            # Audio Features
            audio_data, rate = sf.read(audio_path, dtype='float32')
            if audio_data.ndim > 1: audio_data = audio_data.mean(axis=1)
            if rate != 22050: audio_data = librosa.resample(audio_data, orig_sr=rate, target_sr=22050)
            
            audio_scores = analyze_audio_features(audio_data, 22050)
            content_score = evaluate_answer(q_text, transcription)
            
            os.remove(audio_path)

            conversation_history.append({
                "question": q_text,
                "answer": transcription,
                "scores": {
                    "content_score": content_score,
                    "audio_confidence": audio_scores.get("confidence", 0),
                    "audio_fluency": audio_scores.get("fluency", 0),
                    "audio_nervousness": audio_scores.get("nervousness", 0),
                    "avg_posture": avg_posture,
                    "eye_contact_percentage": avg_eye,
                    "total_blinks": blinks
                }
            })

        final_report = _generate_final_report(conversation_history)

        # --- SAVE TO MONGODB ---
        interview_doc = {
            "user_id": user_id,
            "timestamp": datetime.utcnow(),
            "report": final_report,
            "details": conversation_history
        }
        await interviews_collection.insert_one(interview_doc)

        return {
            "status": "COMPLETE",
            "final_report": final_report,
            "full_conversation": conversation_history
        }
    except Exception as e:
        print(f"Error in submit: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)