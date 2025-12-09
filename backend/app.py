import json
import asyncio
import uuid
import random
from datetime import datetime
from typing import List, Optional, Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize App
app = FastAPI(title="AI Mock Interview API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IN-MEMORY DATABASE ---
sessions_db = {} 

# --- DATA MODELS ---
class ResumeScoreRequest(BaseModel):
    resume_id: str
    job_role: str

class InterviewStartRequest(BaseModel):
    role: str
    experience: str
    interview_type: str
    question_count: int = 5         # Default to 5
    resume_context: Optional[str] = None  # Text content from resume

# --- API ENDPOINTS ---

@app.get("/")
async def root():
    return {"status": "active", "message": "AI Backend Ready"}

# 1. Resume Upload
@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    await asyncio.sleep(1) # Sim processing
    resume_id = str(uuid.uuid4())
    # In a real app, use PDFMiner here. We mock extraction for now.
    raw_text = f"Candidate Resume: {file.filename}. Skills: React, Python, FastAPI."
    return {
        "resume_id": resume_id,
        "raw_text": raw_text
    }

# 2. Resume Score
@app.post("/api/resume/score")
async def score_resume(request: ResumeScoreRequest):
    await asyncio.sleep(1.5)
    return {
        "score": random.randint(70, 95),
        "strengths": ["Good technical keywords", "Clear formatting"],
        "weaknesses": ["Missing quantifiable results"],
        "suggestions": ["Add more metrics to your project descriptions"]
    }

# 3. Start Interview
@app.post("/api/interview/start")
async def start_interview(request: InterviewStartRequest):
    session_id = str(uuid.uuid4())
    
    # Generate tailored first question
    if request.resume_context:
        first_q = f"I reviewed your resume and saw experience with {request.role}. Can you walk me through a project where you used these skills?"
    else:
        first_q = f"Welcome. You are applying for a {request.role} role. Tell me about yourself."

    # Store session state
    sessions_db[session_id] = {
        "config": request.dict(),
        "questions": [first_q],
        "answers": [],
        "scores": [],
        "current_q_index": 0,
        "total_questions": request.question_count,
        "start_time": datetime.now()
    }
    
    return {
        "session_id": session_id,
        "first_question": first_q
    }

# 4. Live Interview WebSocket
@app.websocket("/api/interview/live/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    
    if session_id not in sessions_db:
        await websocket.close(code=4004)
        return

    session = sessions_db[session_id]
    
    # 1. Send the first question immediately
    await websocket.send_json({
        "type": "question",
        "content": session["questions"][0]
    })
    
    try:
        while True:
            # 2. Receive User Data
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "user_answer_finished":
                user_content = message.get("content", "")
                session["answers"].append(user_content)
                
                # --- AI ANALYSIS PHASE ---
                await websocket.send_json({"type": "status", "content": "AI is analyzing response..."})
                await asyncio.sleep(1.5) # Fake latency
                
                # Send Score
                await websocket.send_json({
                    "type": "analysis",
                    "clarity": random.randint(80, 98),
                    "confidence": random.randint(75, 95),
                    "speed": random.randint(110, 140)
                })
                
                await asyncio.sleep(1) # Pause before next Q

                # --- NEXT QUESTION PHASE ---
                session["current_q_index"] += 1
                
                if session["current_q_index"] >= session["total_questions"]:
                    # Limit reached -> End Session
                    await websocket.send_json({
                        "type": "end",
                        "message": "Interview completed. Generating report..."
                    })
                    break
                else:
                    # Generate Next Question
                    next_q = f"Question {session['current_q_index'] + 1}: How would you handle a difficult technical challenge in this role?"
                    session["questions"].append(next_q)
                    
                    await websocket.send_json({
                        "type": "question",
                        "content": next_q
                    })

    except WebSocketDisconnect:
        print(f"Session {session_id} disconnected")

# 5. Report Endpoint
@app.get("/api/interview/report/{session_id}")
async def get_report(session_id: str):
    if session_id not in sessions_db:
        # Mock fallback
        return {"overall_score": 0, "summary": "Session not found"}
        
    session = sessions_db[session_id]
    return {
        "overall_score": 85,
        "clarity": 88,
        "confidence": 82,
        "technical_depth": 79,
        "summary": f"Completed {session['total_questions']} questions for {session['config']['role']}.",
        "strengths": ["Good pacing", "Relevant examples"],
        "weaknesses": ["Minor filler words"],
        "questions_and_answers": [
            {"q": q, "a": "Candidate audio/text..."} for q in session["questions"]
        ]
    }

# 6. Dashboard Endpoint
@app.get("/api/dashboard/{user_id}")
async def get_dashboard(user_id: str):
    return {
        "resume_scores": [75, 82, 88],
        "interview_scores": [65, 72, 85],
        "recent_activities": [
            {"type": "interview", "date": "2023-10-05", "score": 85},
            {"type": "resume", "date": "2023-10-02", "score": 88}
        ]
    }