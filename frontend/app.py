import streamlit as st
import requests
import io
import time
import os
import tempfile
import numpy as np
import cv2
import av
import json
import base64
from streamlit_webrtc import webrtc_streamer, VideoProcessorFactory, RTCConfiguration
from streamlit_mic_recorder import mic_recorder
from threading import Lock

# --- Configuration ---
BACKEND_URL = "http://127.0.0.1:8000" # Your FastAPI server URL
RTC_CONFIGURATION = RTCConfiguration({"iceServers": [{"urls": ["stun:stun.l.google.com:19302"]}]})

# --- Page Setup ---
st.set_page_config(
    page_title="AI Interview Platform",
    page_icon="🤖",
    layout="wide" # Use "wide" for a dashboard
)

# --- Session State (Dumb client, just holds data) ---
if 'step' not in st.session_state:
    st.session_state.step = "home" # Start at the new homepage
    
if 'session_id' not in st.session_state:
    st.session_state.session_id = None # From the /start_interview endpoint
    
if 'resume_data' not in st.session_state:
    st.session_state.resume_data = None # Holds parsed JSON (skills, etc.)
    
if 'resume_analysis' not in st.session_state:
    st.session_state.resume_analysis = None # Holds score, skills, etc.
    
if 'interview_plan' not in st.session_state:
    st.session_state.interview_plan = [] # The list of questions
    
if 'current_question_index' not in st.session_state:
    st.session_state.current_question_index = 0
    
if 'cv_scores_list' not in st.session_state:
    st.session_state.cv_scores_list = [] # List of [posture, eye, blink]
    
if 'cv_lock' not in st.session_state:
    st.session_state.cv_lock = Lock()
    
if 'final_report' not in st.session_state:
    st.session_state.final_report = None
    
if 'conversation_history' not in st.session_state:
    st.session_state.conversation_history = [] 
    
if 'current_coding_problem' not in st.session_state:
    st.session_state.current_coding_problem = None
if 'current_code_review' not in st.session_state:
    st.session_state.current_code_review = None
if 'coding_step' not in st.session_state:
    st.session_state.coding_step = "select_type" # New for the sub-menu

# --- Helper to play base64 audio ---
def play_b64_audio(b64_string: str, autoplay: bool = False):
    """Decodes base64 audio and plays it in Streamlit."""
    try:
        audio_data = f"data:audio/mp3;base64,{b64_string}"
        st.audio(audio_data, format='audio/mp3', start_time=0, autoplay=autoplay)
    except Exception as e:
        print(f"Error playing b64 audio: {e}")
        st.warning("Could not play audio.")

# === (All helper functions for CV, recording, etc. go here) ===

# --- CV Video Processor ---
class VideoProcessor:
    def __init__(self):
        self.frame_lock = Lock()
        self.posture_score = 0.5
        self.eye_contact = False
        self.blink_detected = False

    def recv(self, frame: av.VideoFrame) -> av.VideoFrame:
        try:
            img = frame.to_ndarray(format="bgr24")
            _, buffer = cv2.imencode('.jpg', img)
            files = {'file': ('frame.jpg', buffer.tobytes(), 'image/jpeg')}
            
            try:
                response = requests.post(f"{BACKEND_URL}/analyze_frame", files=files, timeout=1.0)
                if response.status_code == 200:
                    data = response.json()
                    with self.frame_lock:
                        self.posture_score = data.get("posture_score", 0.5)
                        self.eye_contact = data.get("eye_contact", False)
                        self.blink_detected = data.get("blink_detected", False)
                    
                    with st.session_state.cv_lock:
                        st.session_state.cv_scores_list.append(
                            (self.posture_score, self.eye_contact, self.blink_detected)
                        )
            except requests.exceptions.RequestException:
                pass 

            with self.frame_lock:
                posture_text = f"Posture: {self.posture_score:.2f}"
                eye_text = f"Eye Contact: {'Yes' if self.eye_contact else 'No'}"
                color_posture = (0, 255, 0) if self.posture_score > 0.7 else (0, 0, 255)
                color_eye = (0, 255, 0) if self.eye_contact else (0, 0, 255)
                cv2.putText(img, posture_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color_posture, 2)
                cv2.putText(img, eye_text, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color_eye, 2)
                
            return av.VideoFrame.from_ndarray(img, format="bgr24")
        except Exception as e:
            return frame

# --- Interview Turn Handler (Saves data locally) ---
def handle_interview_turn(audio_bytes: bytes):
    """
    This is the core "dumb" function. It sends the recorded audio
    and the CV scores to the "brain" backend.
    """
    with st.spinner("Analyzing your answer..."):
        try:
            # --- 1. Get CV Scores (from this turn) ---
            with st.session_state.cv_lock:
                cv_scores_list = list(st.session_state.cv_scores_list)
                st.session_state.cv_scores_list = [] # Reset for next turn
            
            # --- 2. Send Audio + CV to the "Brain" (/submit_turn) ---
            files = {
                'session_id': (None, st.session_state.session_id),
                'cv_scores_json': (None, json.dumps(cv_scores_list)),
                'audio_file': ('audio.wav', audio_bytes, 'audio/wav')
            }
            
            response = requests.post(f"{BACKEND_URL}/submit_turn", files=files)

            if response.status_code != 200:
                st.error(f"Error processing your answer: {response.json().get('detail')}")
                st.session_state.step = "home" # Boot to start
                st.rerun()
                return

            # --- 3. Get the "Brain's" response ---
            data = response.json()
            
            # --- 4. Check the status from the "Brain" ---
            if data.get("status") == "CONTINUE":
                # --- The loop continues ---
                st.session_state.current_question_index += 1
                # Store the *new* question and feedback from the backend
                st.session_state.current_question_text = data.get("next_question_text")
                st.session_state.current_question_audio_b64 = data.get("next_question_audio_b64")
                st.session_state.step = "conduct_interview" # Stay on this step
                st.rerun() # Rerun to play the new audio

            elif data.get("status") == "COMPLETE":
                # --- The interview is over ---
                st.session_state.final_report = data.get("final_report")
                st.session_state.conversation_history = data.get("full_conversation")
                st.session_state.step = "interview_report"
                st.rerun()
            
            else:
                st.error("Received an unknown response from the server.")
                st.session_state.step = "home"
                st.rerun()

        except Exception as e:
            st.error(f"An error occurred during your turn: {e}")
            st.session_state.step = "home"
            st.rerun()

# --- Coding Challenge Helpers ---
def get_resume_skills(uploaded_file):
    """
    Helper to call the /parse_resume endpoint.
    Returns a list of skills.
    """
    with st.spinner("Parsing resume for skills..."):
        try:
            files = {'file': (uploaded_file.name, uploaded_file.getvalue(), 'application/pdf')}
            response = requests.post(f"{BACKEND_URL}/parse_resume", files=files)
            
            if response.status_code == 200:
                parsed_data = response.json()
                st.session_state.resume_data = parsed_data # Save for later
                return parsed_data.get("skills", [])
            else:
                st.error(f"Could not parse resume: {response.json().get('detail')}")
                return []
                
        except Exception as e:
            st.error(f"Error parsing resume: {e}")
            return []

def generate_coding_problem(skills: list, difficulty: str):
    """Calls backend to get a coding problem."""
    with st.spinner("Generating a coding challenge..."):
        try:
            payload = {"skills": skills, "difficulty": difficulty}
            response = requests.post(f"{BACKEND_URL}/generate_coding_problem", json=payload)
            if response.status_code == 200:
                st.session_state.current_coding_problem = response.json()
                st.session_state.coding_step = "solve_problem" # Move to solve step
            else:
                st.error("Could not generate a coding problem.")
        except Exception as e:
            st.error(f"An error occurred: {e}")

def evaluate_code(problem_description: str, user_code: str):
    """Sends code to backend for AI review."""
    with st.spinner("Your solution is being reviewed by our AI Engineer..."):
        try:
            payload = {
                "problem_description": problem_description,
                "user_code": user_code
            }
            response = requests.post(f"{BACKEND_URL}/evaluate_code", json=payload)
            if response.status_code == 200:
                st.session_state.current_code_review = response.json().get("review_text")
            else:
                st.error("Could not get a review for your code.")
        except Exception as e:
            st.error(f"An error occurred: {e}")


# === Main App Logic (The "Router") ===

# --- A simple "Back to Home" button for other pages ---
def go_home_button():
    if st.button("🏠 Back to Home"):
        # Reset all states
        st.session_state.step = "home"
        st.session_state.resume_file_bytes = None
        st.session_state.resume_data = None
        st.session_state.resume_analysis = None
        st.session_state.interview_plan = []
        st.session_state.current_question_index = 0
        st.session_state.full_interview_data = []
        st.session_state.final_report = None
        st.session_state.cv_scores_list = []
        st.session_state.current_coding_problem = None
        st.session_state.current_code_review = None
        st.session_state.coding_step = "select_type"
        st.rerun()

# --- PAGE 1: THE "DASHBOARD" HOMEPAGE ---
if st.session_state.step == "home":
    st.title("🤖 AI Interview Platform")
    st.write("Welcome! This is your personal AI-powered career coach. Choose a tool to get started.")
    
    st.subheader("Our Tools")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("📊 AI Resume Analyzer", use_container_width=True, help="Score your resume against a job description."):
            st.session_state.step = "resume_analyzer"
            st.session_state.resume_analysis = None # Clear old results
            st.rerun()
    
    with col2:
        if st.button("🎙️ AI Mock Interview", use_container_width=True, help="Practice a full, spoken interview with AI."):
            st.session_state.step = "interview_setup"
            st.rerun()
            
    with col3:
        if st.button("💻 AI Code Review", use_container_width=True, help="Get your code reviewed by a 'FAANG-style' AI engineer."):
            st.session_state.step = "coding_challenge"
            st.session_state.coding_step = "select_type" # Reset coding sub-step
            st.session_state.current_coding_problem = None
            st.session_state.current_code_review = None
            st.rerun()

# --- PAGE 2: RESUME ANALYZER ---
elif st.session_state.step == "resume_analyzer":
    go_home_button()
    st.header("📊 AI Resume Analyzer")
    st.write("See how well your resume matches a job description.")
    
    uploaded_file = st.file_uploader("Upload your resume (PDF)", type=["pdf"])
    job_description = st.text_area("Paste the Job Description here", height=200)
    
    if st.button("Analyze Resume"):
        if uploaded_file and job_description:
            with st.spinner("Analyzing your resume against the job..."):
                try:
                    files = {
                        'file': (uploaded_file.name, uploaded_file.getvalue(), 'application/pdf'),
                        'job_description': (None, job_description)
                    }
                    response = requests.post(f"{BACKEND_URL}/score_resume", files=files)
                    
                    if response.status_code == 200:
                        st.session_state.resume_analysis = response.json()
                    else:
                        st.error(f"Error analyzing resume: {response.json().get('detail')}")

                except requests.exceptions.ConnectionError:
                    st.error("Connection Error: Is the backend server running?")
                except Exception as e:
                    st.error(f"An unexpected error occurred: {e}")
        else:
            st.warning("Please upload your resume AND paste a job description.")
            
    if st.session_state.resume_analysis:
        st.subheader("Your Resume Analysis")
        score = st.session_state.resume_analysis.get('resume_score', 0)
        
        st.metric("Resume Match Score", f"{score}%")
        
        st.subheader("Profile Summary")
        st.write(st.session_state.resume_analysis.get('profile_summary', 'N/A'))
        
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("✅ Matched Skills")
            st.multiselect("Matched Skills", options=st.session_state.resume_analysis.get('matched_skills', []), default=st.session_state.resume_analysis.get('matched_skills', []))
        with col2:
            st.subheader("❌ Missing Skills")
            st.multiselect("Missing Skills", options=st.session_state.resume_analysis.get('missing_skills', []), default=st.session_state.resume_analysis.get('missing_skills', []))

# --- PAGE 3a: INTERVIEW SETUP ---
elif st.session_state.step == "interview_setup":
    go_home_button()
    st.header("🎙️ Mock Interview Setup")
    
    uploaded_file = st.file_uploader("Upload your resume (PDF)", type=["pdf"])
    
    col1, col2 = st.columns(2)
    with col1:
        difficulty = st.selectbox("Select Difficulty", ["Easy", "Medium", "Hard"])
    with col2:
        num_questions = st.number_input("Number of Questions", min_value=1, max_value=5, value=3)
        
    if st.button("Start Interview"):
        if uploaded_file:
            with st.spinner("Analyzing resume and building interview..."):
                try:
                    files = {
                        'file': (uploaded_file.name, uploaded_file.getvalue(), 'application/pdf'),
                        'difficulty': (None, difficulty.lower()),
                        'num_questions': (None, str(num_questions)),
                    }
                    response = requests.post(f"{BACKEND_URL}/generate_interview_plan", files=files)
                    
                    if response.status_code == 200:
                        data = response.json()
                        st.session_state.resume_data = data.get("resume_data") # Save skills
                        st.session_state.interview_plan = data.get("interview_plan", [])
                        st.session_state.current_question_index = 0
                        st.session_state.full_interview_data = []
                        st.session_state.cv_scores_list = []
                        st.session_state.final_report = None
                        
                        if not st.session_state.interview_plan:
                            st.error("The AI failed to generate questions. Please try again.")
                        else:
                            st.session_state.step = "conduct_interview"
                            st.rerun()
                    else:
                        st.error(f"Error starting interview: {response.json().get('detail')}")
                
                except requests.exceptions.ConnectionError:
                    st.error("Connection Error: Is the backend server running?")
                except Exception as e:
                    st.error(f"An unexpected error occurred: {e}")
        else:
            st.error("Please upload your resume to start.")

# --- PAGE 3b: CONDUCT INTERVIEW ---
elif st.session_state.step == "conduct_interview":
    q_index = st.session_state.current_question_index
    q_total = len(st.session_state.interview_plan)
    current_q = st.session_state.interview_plan[q_index]
    
    st.header(f"Interview Question {q_index + 1} of {q_total}")
    
    st.subheader("Interviewer Question:")
    play_b64_audio(current_q["question_audio_b64"], autoplay=True)
    st.info(f"**{current_q['question_text']}**")
    
    st.warning("Your camera is live. Press 'Start Recording' below to record your audio answer.")
    st.write("---")
    
    st.subheader("Live Video Feed")
    webrtc_streamer(
        key="webcam",
        video_processor_factory=VideoProcessor, 
        rtc_configuration=RTC_CONFIGURATION,
        media_stream_constraints={"video": True, "audio": False},
        async_processing=True,
    )

    st.write("---")
    
    st.subheader("Record Your Answer")
    audio_bytes_dict = mic_recorder(
        key='recorder',
        start_prompt="Start Recording Answer",
        stop_prompt="Stop Recording",
        format="wav"
    ) 
    
    if audio_bytes_dict and audio_bytes_dict['bytes']:
        st.subheader("Answer Saved!")
        wav_audio_data = audio_bytes_dict['bytes']
        handle_interview_turn(wav_audio_data)

# --- PAGE 3c: SUBMIT INTERVIEW (LOADING) ---
elif st.session_state.step == "submit_interview":
    submit_full_interview()

# --- PAGE 3d: INTERVIEW REPORT ---
elif st.session_state.step == "interview_report":
    go_home_button()
    st.header("Your Final Interview Report")
    
    report = st.session_state.final_report
    if report:
        st.balloons()
        st.metric(label="**Your Final Score**", value=f"{report['final_score_percentage']:.1f}%")
        
        st.subheader("Detailed Breakdown (Averages)")
        
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("**Content & Communication**")
            st.metric(label="Answer Content Score", value=f"{report['avg_content_score'] * 100:.0f}%")
            st.metric(label="Audio Fluency", value=f"{report['avg_audio_fluency'] * 100:.0f}%")
        with col2:
            st.markdown("**Presence & Confidence**")
            st.metric(label="Audio Confidence", value=f"{report['avg_audio_confidence'] * 100:.0f}%")
            st.metric(label="Overall Nervousness", value=f"{report['overall_nervousness_score'] * 100:.0f}% (Lower is better)")

        col3, col4 = st.columns(2)
        with col3:
            st.markdown("**Body Language**")
            st.metric(label="Avg. Posture Score", value=f"{report['avg_posture']*100:.0f}%")
        with col4:
            st.markdown("**Attention**")
            st.metric(label="Avg. Eye Contact", value=f"{report['avg_eye_contact_percentage']*100:.0f}% of the time")
            st.metric(label="Avg. Blinks per Answer", value=f"{report['avg_blinks_per_answer']:.1f}")
            
        st.write("---")
        
        with st.expander("See Full Conversation Transcript"):
            for i, turn in enumerate(st.session_state.conversation_history):
                st.markdown(f"**Question {i+1}:** {turn['question']}")
                st.markdown(f"**Your Answer:** *{turn['answer']}*")
                st.divider()
        
        st.subheader("Next Steps")
        if st.button("Try a Coding Challenge"):
            st.session_state.step = "coding_challenge"
            st.session_state.coding_step = "select_type" # Go to the *start* of the code flow
            st.session_state.current_coding_problem = None
            st.session_state.current_code_review = None
            st.rerun()

# --- PAGE 4: CODING CHALLENGE (NOW WITH NEW FLOW) ---
elif st.session_state.step == "coding_challenge":
    go_home_button()
    st.header("💻 AI Code Review")
    
    # --- STEP 4a: Select Type ---
    if st.session_state.coding_step == "select_type":
        st.subheader("Select Challenge Type")
        st.write("Get a problem based on your resume, or a general problem by difficulty.")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("General Problem", use_container_width=True, help="Get a random problem by difficulty."):
                st.session_state.coding_step = "select_general"
                st.rerun()
        with col2:
            if st.button("Based on Your Resume", use_container_width=True, help="Get a problem based on skills from your resume."):
                st.session_state.coding_step = "upload_resume_for_code"
                st.rerun()
                
    # --- STEP 4b: General Difficulty ---
    elif st.session_state.coding_step == "select_general":
        st.subheader("Select General Difficulty")
        col1, col2, col3 = st.columns(3)
        if col1.button("Easy", use_container_width=True):
            generate_coding_problem(skills=[], difficulty="easy")
        if col2.button("Medium", use_container_width=True):
            generate_coding_problem(skills=[], difficulty="medium")
        if col3.button("Hard", use_container_width=True):
            generate_coding_problem(skills=[], difficulty="hard")
            
    # --- STEP 4c: Upload Resume (for this flow) ---
    elif st.session_state.coding_step == "upload_resume_for_code":
        st.subheader("Upload Your Resume")
        st.write("We'll parse your resume to get skills for a personalized problem.")
        
        code_resume_file = st.file_uploader("Upload your resume (PDF)", type=["pdf"], key="code_resume_up")
        
        if code_resume_file:
            skills = get_resume_skills(code_resume_file)
            if skills:
                st.session_state.resume_data = {"skills": skills} # Save skills
                st.session_state.coding_step = "select_resume_difficulty"
                st.rerun()
            else:
                st.error("Could not extract skills from this resume. Please try another or select 'General Problem'.")

    # --- STEP 4d: Select Difficulty (for resume) ---
    elif st.session_state.coding_step == "select_resume_difficulty":
        st.subheader("Select Difficulty (Personalized)")
        st.write("We will use these skills for your problem:", st.session_state.resume_data.get('skills', []))
        
        col1, col2, col3 = st.columns(3)
        skills = st.session_state.resume_data.get('skills', [])
        if col1.button("Easy", use_container_width=True):
            generate_coding_problem(skills=skills, difficulty="easy")
        if col2.button("Medium", use_container_width=True):
            generate_coding_problem(skills=skills, difficulty="medium")
        if col3.button("Hard", use_container_width=True):
            generate_coding_problem(skills=skills, difficulty="hard")
            
    # --- STEP 4e: Solve the Problem (Final Step) ---
    elif st.session_state.coding_step == "solve_problem":
        problem = st.session_state.current_coding_problem
        if problem:
            st.subheader(problem.get("title", "Coding Problem"))
            st.info(problem.get("description", "Could not load problem."))
            
            st.write("---")
            
            user_code = st.text_area("Write your code solution here:", height=300)
            
            if st.button("Submit Code for Review"):
                if user_code:
                    evaluate_code(problem.get("description"), user_code)
                else:
                    st.warning("Please write some code before submitting.")
                    
            if st.session_state.current_code_review:
                st.subheader("AI Engineer's Review")
                st.markdown(st.session_state.current_code_review)
                
                if st.button("Try a different problem"):
                    st.session_state.coding_step = "select_type"
                    st.session_state.current_coding_problem = None
                    st.session_state.current_code_review = None
                    st.rerun()
        else:
            st.error("No problem loaded.")
            st.session_state.coding_step = "select_type"
            st.rerun()