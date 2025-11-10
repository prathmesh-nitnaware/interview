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
    page_title="AI Mock Interview",
    page_icon="🤖",
    layout="centered"
)
st.title("🤖 AI-Powered Mock Interview")

# --- Session State (Dumb client, just holds data) ---
if 'step' not in st.session_state:
    st.session_state.step = "upload_resume"
    
if 'resume_file' not in st.session_state:
    st.session_state.resume_file = None # Holds the raw resume.pdf file
    
if 'resume_data' not in st.session_state:
    st.session_state.resume_data = None # Holds the parsed JSON
    
if 'interview_plan' not in st.session_state:
    st.session_state.interview_plan = [] # The list of questions from the backend
    
if 'current_question_index' not in st.session_state:
    st.session_state.current_question_index = 0
    
if 'cv_scores_list' not in st.session_state:
    st.session_state.cv_scores_list = [] # List of [posture, eye, blink] for *one* turn
    
if 'cv_lock' not in st.session_state:
    st.session_state.cv_lock = Lock()
    
if 'final_report' not in st.session_state:
    st.session_state.final_report = None
    
if 'full_interview_data' not in st.session_state:
    st.session_state.full_interview_data = [] # List of {"question": str, "audio_bytes": bytes, "cv_scores": list}
    
if 'current_coding_problem' not in st.session_state:
    st.session_state.current_coding_problem = None
if 'current_code_review' not in st.session_state:
    st.session_state.current_code_review = None

# --- Helper to play base64 audio ---
def play_b64_audio(b64_string: str, autoplay: bool = False):
    """Decodes base64 audio and plays it in Streamlit."""
    try:
        audio_data = f"data:audio/mp3;base64,{b64_string}"
        st.audio(audio_data, format='audio/mp3', start_time=0, autoplay=autoplay)
    except Exception as e:
        print(f"Error playing b64 audio: {e}")
        st.warning("Could not play audio.")

# === STEP 1: RESUME UPLOAD ===
def handle_interview_setup(uploaded_file, difficulty, num_questions):
    """
    Called when user clicks "Start Interview".
    Sends resume + settings to the backend to get the full list of questions.
    """
    with st.spinner("Analyzing your resume and building your personalized interview..."):
        try:
            # Send PDF and form data to the /generate_interview_questions endpoint
            files = {
                'file': (uploaded_file.name, uploaded_file.getvalue(), 'application/pdf'),
                'difficulty': (None, difficulty),
                'num_questions': (None, str(num_questions)),
            }
            
            response = requests.post(f"{BACKEND_URL}/generate_interview_questions", files=files)
            
            if response.status_code == 200:
                data = response.json()
                
                # --- Store the entire plan from the backend ---
                st.session_state.resume_data = data.get("resume_data")
                st.session_state.interview_plan = data.get("interview_plan", [])
                
                # Reset all counters and data for a new session
                st.session_state.current_question_index = 0
                st.session_state.full_interview_data = []
                st.session_state.cv_scores_list = []
                st.session_state.final_report = None
                
                if not st.session_state.interview_plan:
                    st.error("The AI failed to generate questions. Please try again.")
                    st.session_state.step = "upload_resume"
                else:
                    # We have the questions, move to the first question
                    st.session_state.step = "conduct_interview"
                st.rerun()
            else:
                st.error(f"Error starting interview: {response.json().get('detail')}")

        except requests.exceptions.ConnectionError:
            st.error("Connection Error: Is the backend server running?")
        except Exception as e:
            st.error(f"An unexpected error occurred: {e}")

# === STEP 2 (The Loop): HANDLE *ONE* INTERVIEW TURN ===
def handle_interview_turn(audio_bytes: bytes):
    """
    This function doesn't call the backend.
    It just saves the user's answer locally.
    """
    with st.spinner("Saving your answer..."):
        try:
            # --- 1. Get CV Scores (from this turn) ---
            with st.session_state.cv_lock:
                cv_scores_list = list(st.session_state.cv_scores_list)
                st.session_state.cv_scores_list = [] # Reset for next turn
            
            # --- 2. Get the current question text ---
            current_q_text = st.session_state.interview_plan[st.session_state.current_question_index]["question_text"]

            # --- 3. Save all data for this turn ---
            turn_data = {
                "question_text": current_q_text,
                "audio_bytes": audio_bytes,
                "cv_scores": cv_scores_list
            }
            st.session_state.full_interview_data.append(turn_data)
            
            # --- 4. Move to the next question ---
            st.session_state.current_question_index += 1
            
            # --- 5. Check if the interview is over ---
            if st.session_state.current_question_index >= len(st.session_state.interview_plan):
                st.session_state.step = "submit_interview" # All questions done, time to submit
            else:
                st.session_state.step = "conduct_interview" # Go to next question
            
            st.rerun()

        except Exception as e:
            st.error(f"An error occurred: {e}")
            st.session_state.step = "upload_resume"
            st.rerun()

# === STEP 3: SUBMIT THE *ENTIRE* INTERVIEW ===
def submit_full_interview():
    """
    Bundles all saved data and sends it to the backend for the final report.
    """
    with st.spinner("Your interview is complete! Analyzing all your answers and generating your final report..."):
        try:
            # --- 1. Prepare the form-data ---
            files_to_send = []
            turn_data_json_list = []
            
            for i, turn in enumerate(st.session_state.full_interview_data):
                audio_key = f"audio_{i}.wav"
                cv_key = f"cv_{i}.json"
                
                # A. Add the files to the list
                files_to_send.append((
                    'files', (audio_key, turn["audio_bytes"], 'audio/wav')
                ))
                files_to_send.append((
                    'files', (cv_key, json.dumps(turn["cv_scores"]), 'application/json')
                ))
                
                # B. Create the JSON data for this turn
                turn_data_json_list.append({
                    "question_text": turn["question_text"],
                    "audio_file_key": audio_key,
                    "cv_scores_key": cv_key
                })

            # Add the main JSON string that describes the files
            files_to_send.append(('turn_data_json', (None, json.dumps(turn_data_json_list))))

            # --- 2. Send all data to the "Brain" ---
            response = requests.post(f"{BACKEND_URL}/submit_full_interview", files=files_to_send)
            
            if response.status_code == 200:
                data = response.json()
                st.session_state.final_report = data.get("final_report")
                st.session_state.conversation_history = data.get("full_conversation")
                st.session_state.step = "show_report"
                st.rerun()
            else:
                st.error(f"Error generating your report: {response.json().get('detail')}")
                st.session_state.step = "upload_resume"
                st.rerun()

        except Exception as e:
            st.error(f"An error occurred during submission: {e}")
            st.session_state.step = "upload_resume"
            st.rerun()

# === (Coding challenge functions are unchanged) ===
def generate_coding_problem():
    with st.spinner("Generating a coding challenge based on your resume..."):
        try:
            payload = {"skills": st.session_state.resume_data.get("skills", [])}
            response = requests.post(f"{BACKEND_URL}/generate_coding_problem", json=payload)
            if response.status_code == 200:
                st.session_state.current_coding_problem = response.json()
            else:
                st.error("Could not generate a coding problem.")
        except Exception as e:
            st.error(f"An error occurred: {e}")

def evaluate_code(problem_description: str, user_code: str):
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

# === (VideoProcessor is unchanged) ===
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

# === Main App Logic (The "Router") ===

# --- Show Step 1: Upload & Setup ---
if st.session_state.step == "upload_resume":
    st.header("Step 1: Setup Your Interview")
    st.write("Upload your resume and choose your settings.")
    
    uploaded_file = st.file_uploader("Upload your resume (PDF)", type=["pdf"])
    
    col1, col2 = st.columns(2)
    with col1:
        difficulty = st.selectbox("Select Difficulty", ["Easy", "Medium", "Hard"])
    with col2:
        num_questions = st.number_input("Number of Questions", min_value=1, max_value=5, value=3)
        
    if st.button("Start Interview"):
        if uploaded_file:
            # Save file to session state to be used
            st.session_state.resume_file = uploaded_file
            handle_interview_setup(uploaded_file, difficulty, num_questions)
        else:
            st.error("Please upload your resume to start.")

# --- Show Step 2: Conduct the Interview ---
elif st.session_state.step == "conduct_interview":
    
    # Get the current question
    q_index = st.session_state.current_question_index
    q_total = len(st.session_state.interview_plan)
    current_q = st.session_state.interview_plan[q_index]
    
    st.header(f"Interview Question {q_index + 1} of {q_total}")
    
    # Play the AI's audio for this question
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
        
        # This just saves the data locally and moves to the next turn
        handle_interview_turn(wav_audio_data)

# --- Run Step 3: Submit (No UI) ---
elif st.session_state.step == "submit_interview":
    # This is a loading step
    submit_full_interview()

# --- Show Step 4: The Final Report ---
elif st.session_state.step == "show_report":
    st.header("Step 4: Your Final Interview Report")
    
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
            st.metric(label="Overall Nervousness", value=f"{report['overall_nervousness_score'] * 100:.0f}%")

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
            st.session_state.current_coding_problem = None
            st.session_state.current_code_review = None
            st.rerun()
        
        if st.button("Start New Interview"):
            st.session_state.step = "upload_resume"
            # We keep the resume, but clear the interview
            st.session_state.interview_plan = []
            st.session_state.current_question_index = 0
            st.session_state.full_interview_data = []
            st.session_state.final_report = None
            st.rerun()

# --- Show Step 5: Coding Challenge ---
elif st.session_state.step == "coding_challenge":
    st.header("Step 5: AI Code Review")
    
    # 1. Get the problem (only once)
    if st.session_state.current_coding_problem is None:
        generate_coding_problem()
    
    problem = st.session_state.current_coding_problem
    if problem:
        st.subheader(problem.get("title", "Coding Problem"))
        st.info(problem.get("description", "Could not load problem."))
        
        st.write("---")
        
        # 2. Get the user's code
        user_code = st.text_area("Write your code solution here:", height=300)
        
        if st.button("Submit Code for Review"):
            if user_code:
                evaluate_code(problem.get("description"), user_code)
            else:
                st.warning("Please write some code before submitting.")
                
        # 3. Show the review
        if st.session_state.current_code_review:
            st.subheader("AI Engineer's Review")
            st.markdown(st.session_state.current_code_review)
            
            if st.button("Try a different problem"):
                st.session_state.current_coding_problem = None
                st.session_state.current_code_review = None
                st.rerun()
    
    st.write("---")
    if st.button("Back to Main Page"):
        st.session_state.step = "upload_resume"
        # Clear all state
        st.session_state.resume_file = None
        st.session_state.resume_data = None
        st.session_state.interview_plan = []
        st.session_state.current_question_index = 0
        st.session_state.full_interview_data = []
        st.session_state.final_report = None
        st.session_state.cv_scores_list = []
        st.session_state.current_coding_problem = None
        st.session_state.current_code_review = None
        st.rerun()