import json
import asyncio
import uuid
import random
import os
from datetime import datetime
from typing import Optional

# MongoDB Dependencies
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load Env
load_dotenv()

# --- DB SETUP ---
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017") # Default to local if no env
client = AsyncIOMotorClient(MONGO_URL)
db = client.prep_ai_db

app = FastAPI(title="Prep AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class UserUpdate(BaseModel):
    name: str
    age: int
    current_job: str
    target_role: str

class InterviewStartRequest(BaseModel):
    role: str
    experience: str
    interview_type: str
    question_count: int = 5
    resume_context: Optional[str] = None
    user_id: str  # Now required to link session to user

# --- ENDPOINTS ---

@app.get("/")
async def root():
    return {"status": "active", "msg": "Prep AI Backend v2.0"}

# 1. USER PROFILE (Get & Update)
@app.get("/api/user/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        # Create default mock user if not exists (for demo)
        default_user = {
            "user_id": user_id,
            "name": "Alex Carter",
            "age": 24,
            "current_job": "Junior Developer",
            "target_role": "Senior Engineer",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
        }
        await db.users.insert_one(default_user)
        return default_user
    return user

@app.post("/api/user/update/{user_id}")
async def update_user(user_id: str, data: UserUpdate):
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": data.dict()}
    )
    return {"success": True}

# 2. DASHBOARD (Real-time Analytics from DB)
@app.get("/api/dashboard/{user_id}")
async def get_dashboard(user_id: str):
    # Fetch user's sessions
    cursor = db.sessions.find({"user_id": user_id}).sort("created_at", -1).limit(5)
    sessions = await cursor.to_list(length=5)
    
    # Calculate Stats
    total_sessions = await db.sessions.count_documents({"user_id": user_id})
    
    # Calculate average score from sessions that have scores
    pipeline = [
        {"$match": {"user_id": user_id, "overall_score": {"$exists": True}}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$overall_score"}}}
    ]
    avg_result = await db.sessions.aggregate(pipeline).to_list(length=1)
    avg_score = int(avg_result[0]['avg_score']) if avg_result else 0

    return {
        "stats": {
            "total_interviews": total_sessions,
            "average_score": avg_score,
            "interviews_this_week": 2 # Mock for now
        },
        "recent_activity": [
            {
                "id": str(s.get("session_id")),
                "role": s["config"]["role"],
                "date": s["created_at"].strftime("%Y-%m-%d"),
                "score": s.get("overall_score", "In Progress")
            } for s in sessions
        ]
    }

# 3. RESUME UPLOAD
@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    await asyncio.sleep(1)
    resume_id = str(uuid.uuid4())
    # Mock Parsing
    raw_text = f"Extracted from {file.filename}: Experienced in Python, React, and Cloud Architecture."
    return {"resume_id": resume_id, "raw_text": raw_text}

# 4. START INTERVIEW
@app.post("/api/interview/start")
async def start_interview(request: InterviewStartRequest):
    session_id = str(uuid.uuid4())
    
    if request.resume_context:
        first_q = f"I see you're applying for {request.role}. Based on your resume, can you explain your experience with the tech stack mentioned?"
    else:
        first_q = f"Welcome. You are applying for {request.role}. Tell me about yourself."

    session_doc = {
        "session_id": session_id,
        "user_id": request.user_id,
        "config": request.dict(),
        "questions": [first_q],
        "answers": [],
        "current_index": 0,
        "created_at": datetime.utcnow(),
        "status": "active"
    }
    
    await db.sessions.insert_one(session_doc)
    return {"session_id": session_id, "first_question": first_q}

# 5. LIVE WEBSOCKET (Real-Time)
@app.websocket("/api/interview/live/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    session = await db.sessions.find_one({"session_id": session_id})
    
    if not session:
        await websocket.close()
        return

    # Send first question
    current_q = session["questions"][-1]
    await websocket.send_json({"type": "question", "content": current_q})
    
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            
            if msg.get("type") == "user_answer_finished":
                user_ans = msg.get("content", "")
                
                # Save answer
                await db.sessions.update_one(
                    {"session_id": session_id}, 
                    {"$push": {"answers": user_ans}}
                )

                # Send Status
                await websocket.send_json({"type": "status", "content": "Analyzing speech pattern..."})
                await asyncio.sleep(1)
                
                # Send Real-Time Metrics
                metrics = {
                    "clarity": random.randint(70, 95),
                    "confidence": random.randint(65, 90),
                    "sentiment": "Positive"
                }
                await websocket.send_json({"type": "analysis", **metrics})
                
                await asyncio.sleep(1)

                # Next Question Logic
                session = await db.sessions.find_one({"session_id": session_id})
                idx = session["current_index"] + 1
                
                if idx >= session["config"]["question_count"]:
                    # Finish
                    final_score = random.randint(75, 95)
                    await db.sessions.update_one(
                        {"session_id": session_id},
                        {"$set": {"status": "completed", "overall_score": final_score}}
                    )
                    await websocket.send_json({"type": "end", "message": "Interview Finished"})
                    break
                else:
                    # New Question
                    next_q = f"Question {idx + 1}: Describe a situation where you had to solve a complex problem."
                    await db.sessions.update_one(
                        {"session_id": session_id},
                        {"$set": {"current_index": idx}, "$push": {"questions": next_q}}
                    )
                    await websocket.send_json({"type": "question", "content": next_q})

    except WebSocketDisconnect:
        pass