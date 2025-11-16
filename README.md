# AI POWERED MOCK INTERVIEW PLATFORM

The future of interviews, where AI is your interviewer, mentor, and code reviewer — all in one.

This repository contains the complete backend (FastAPI) and a lightweight frontend (Streamlit) for a next-generation AI interview system.
The backend does all the heavy lifting — AI logic, ML models, NLP scoring — so any frontend (Streamlit, React, Flutter, etc.) can connect easily.

🚀 1. **Features Added (Current)**
🎯 Personalized Interview Generation

Endpoint: POST /start_interview

Parses resume.pdf to extract skills.

Generates full interview questions based on:

User’s extracted skills

Difficulty level (Easy, Medium, Hard)

Number of questions

🔊 AI-Spoken Questions (TTS)

Uses gTTS to convert all AI-generated questions into audio (base64).

Frontend simply plays the audio — no extra logic needed.

👀 Live CV & Body Language Analysis

Endpoint: POST /analyze_frame

Analyzes webcam frames using MediaPipe for:

Posture Scoring (Slouching vs Upright)

Eye Contact Tracking (3D Head Pose)

Blink Detection (Nervousness Indicators)

🧠 Complete Interview Submission & Analysis

Endpoint: POST /submit_full_interview

Performs multi-stage evaluation:

Speech-to-Text (Whisper) for transcription

Vocal Tone Analysis (Librosa) for Confidence, Fluency, Jitter

Content Scoring (Ollama) for technical correctness

Heuristic Nervousness Model combining:

Audio Jitter (60% weight)

Blink Rate (40% weight)

📊 Final Report Generation

Combines all analysis metrics:

Content

Communication

Posture

Confidence

Returns a complete JSON report with weighted scoring.

💻 AI Code Review Module

Endpoint: POST /generate_coding_problem
Generates a LeetCode-style question using Ollama.

Endpoint: POST /evaluate_code
Produces a FAANG-level code review covering Correctness, Big O, and Suggestions.

🧩 2. Prerequisites (System-Level)

Before running the project, make sure these are installed:

Python 3.10 (required for mediapipe compatibility)

Ollama (core LLM engine)

Mistral model (run ollama pull mistral)

FFmpeg (required for whisper and audio features)

FFmpeg Installation

Windows:
```
winget install Gyan.FFmpeg
```
or
```
choco install ffmpeg
```

macOS:
```
brew install ffmpeg
```

Linux:
```
sudo apt install ffmpeg
```

🧬 3. Clone the Repository
```
git clone https://github.com/prathmesh-nitnaware/techfest-ai-interview.git
cd techfest-ai-interview
```

⚡ 4. How to Run the Project

This system runs in three separate terminals — one for each part.

🧠 Terminal 1: Start the AI Model (Ollama)
```
ollama serve
```

If Ollama is already running, you can skip this step.

🧩 Terminal 2: Run the Backend (FastAPI)
```
# Go to the project directory
cd /path/to/TECHFEST

# Create a Python 3.10 virtual environment
py -3.10 -m venv .venv

# Activate the environment
# Windows
.\.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install fastapi "uvicorn[standard]" python-multipart openai-whisper mediapipe opencv-python librosa soundfile requests numpy spacy PyPDF2 gTTS streamlit streamlit-webrtc streamlit-mic-recorder

# Download spaCy model
python -m spacy download en_core_web_sm

# Run the backend server
uvicorn backend.app:app --reload
```

The backend runs on http://127.0.0.1:8000

🖥 Terminal 3: Run the Frontend (Streamlit)
```
# Go to the project directory
cd /path/to/TECHFEST

# Activate the same environment
# Windows
.\.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# Run Streamlit app
streamlit run frontend/app.py
```

🧾 5. Project Summary

Backend (Brain) - FastAPI handles all AI/ML logic

Frontend (Face) - Streamlit serves as a simple test client

AI Model - Ollama (Mistral) powers the intelligence layer

**Featues to add:**
1. Proper Frontend 
2. Technical interview part 
3. Have to connect db to store some video clips
4. Have to debug some bugs
5. More enhancement 
