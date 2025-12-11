import os
import json
from flask import Blueprint, request, jsonify
from utils.ai_client import client, MODEL_NAME

# --- 1. INITIALIZE BLUEPRINT ---
interview_bp = Blueprint('interview', __name__)

# --- 2. DSA QUESTION BANK (Fallback) ---
@interview_bp.route('/dsa', methods=['GET'])
def get_dsa_question():
    difficulty = request.args.get('difficulty', 'easy').lower()
    questions = {
        "easy": {"title": "Two Sum", "description": "Given an array of integers, return indices...", "input_format": "nums = [2,7]", "output_format": "[0,1]"},
        "medium": {"title": "Longest Substring", "description": "Find the length...", "input_format": "s = 'abc'", "output_format": "3"},
        "hard": {"title": "Median Arrays", "description": "Find median...", "input_format": "nums1=[1,3], nums2=[2]", "output_format": "2.0"}
    }
    return jsonify(questions.get(difficulty, questions['easy']))

# --- 3. INITIATE SESSION (Handles both Voice & Coding Setup) ---
@interview_bp.route('/initiate', methods=['POST'])
def initiate_session():
    print("------------------------------------------------")
    print("🟢 INITIATE SESSION HIT")
    
    data = request.json
    role = data.get('role', 'Software Engineer')
    experience = data.get('experience', '0-2 Years')
    focus = data.get('focus', 'Technical') 
    intensity = data.get('intensity', 3)
    resume_context = data.get('resume_context', '')

    print(f"Role: {role} | Focus: {focus}")

    # DYNAMIC PROMPT SELECTION
    if focus == 'Coding':
        # Prompt for Coding Round
        prompt = f"""
        Act as a Coding Interviewer. Start a coding session for a {role} ({experience}).
        Resume Context: "{resume_context[:2000]}"
        
        Generate the FIRST coding problem.
        It must include clear Input/Output formats.
        
        Return ONLY valid JSON (no markdown):
        {{
            "title": "Problem Title",
            "description": "Problem Description...",
            "input_format": "e.g. n = 5",
            "output_format": "e.g. 120"
        }}
        """
    else:
        # Prompt for Voice/Technical Interview
        prompt = f"""
        Act as a Technical Interviewer. Start a {focus} interview for a {role} with {experience} experience.
        Resume Context: "{resume_context[:2500]}"
        
        Based on the resume, generate the FIRST verbal interview question.
        
        Return ONLY valid JSON (no markdown):
        {{
            "title": "Question Title",
            "description": "The question text...",
            "input_format": "N/A",
            "output_format": "N/A"
        }}
        """
    
    try:
        chat_response = client.chat.complete(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        content = chat_response.choices[0].message.content.replace('```json', '').replace('```', '')
        return jsonify(json.loads(content))

    except Exception as e:
        print(f"❌ INIT ERROR: {e}")
        return jsonify({"error": "Failed to start session"}), 500

# --- 4. SUBMIT ANSWER (Handles both Verbal & Code) ---
@interview_bp.route('/submit', methods=['POST'])
def submit_code():
    print("------------------------------------------------")
    print("🟢 SUBMIT HIT")
    
    data = request.json
    answer = data.get('code', '')
    question_title = data.get('question_title', 'Unknown Question')
    mode = data.get('mode', 'code') # 'verbal' or 'code'
    
    # Extract Behavioral Metrics (only present for verbal)
    metrics = data.get('metrics', {})
    wpm = metrics.get('wpm', 0)
    fillers = metrics.get('filler_words', 0)

    print(f"Mode: {mode} | Question: {question_title}")

    # A. VERBAL ANALYSIS (Behavioral + Technical)
    if mode == 'verbal':
        prompt = f"""
        Act as a Behavioral & Technical Interviewer. 
        Question: '{question_title}'
        User Answer Transcript: "{answer}"
        
        Behavioral Data:
        - Speaking Pace: {wpm} WPM
        - Filler Words: {fillers}
        
        Evaluate:
        1. Clarity (Sentence structure, pace)
        2. Confidence (Hesitation, fillers)
        3. Technical Accuracy (Content)
        
        Return strictly valid JSON:
        {{
            "technical_accuracy": "High/Medium/Low",
            "clarity_score": 8,
            "confidence_score": 7,
            "feedback": "2-3 sentences feedback on tone and content."
        }}
        """
    
    # B. CODE REVIEW (Syntax + Logic)
    else:
        prompt = f"""
        Act as a Senior Developer. Review this Python code for the problem '{question_title}'.
        
        Code:
        {answer}
        
        Return strictly valid JSON:
        {{
            "correctness": "Yes/No/Partial",
            "time_complexity": "e.g. O(n)",
            "rating": "8",
            "feedback": "Short feedback on logic, bugs, and edge cases."
        }}
        """
    
    try:
        chat_response = client.chat.complete(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        content = chat_response.choices[0].message.content.replace('```json', '').replace('```', '')
        return jsonify({"success": True, "review": json.loads(content)})

    except Exception as e:
        print(f"❌ SUBMIT ERROR: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

# --- 5. NEXT QUESTION (Dynamic Logic) ---
@interview_bp.route('/next-question', methods=['POST'])
def get_next_question():
    print("------------------------------------------------")
    print("🟢 NEXT QUESTION HIT")
    data = request.json
    
    role = data.get('role', 'Software Engineer')
    experience = data.get('experience', '0-2 Years')
    focus = data.get('focus', 'Technical')
    current_question = data.get('current_question', '')
    resume_context = data.get('resume_context', '')

    print(f"Generating next for Focus: {focus}")

    # A. CODING ROUND: Generate a NEW Coding Problem
    if focus == 'Coding':
        prompt = f"""
        Act as a Coding Interviewer.
        The candidate just solved: "{current_question}".
        
        Generate a NEW, DIFFERENT coding problem suitable for {experience} level.
        Do NOT repeat the previous concept.
        
        Return JSON:
        {{
            "title": "New Problem Title",
            "description": "Problem Description...",
            "input_format": "e.g. Array of integers",
            "output_format": "e.g. Integer"
        }}
        """
    
    # B. VOICE INTERVIEW: Generate a NEW Verbal Question
    else:
        prompt = f"""
        Act as a Technical Interviewer. 
        Role: {role}
        Experience: {experience}
        
        The candidate just answered: "{current_question}".
        
        Generate the NEXT distinct verbal interview question based on resume context: 
        "{resume_context[:1000]}"
        
        Return ONLY valid JSON:
        {{
            "title": "Question Title",
            "description": "The question text...",
            "input_format": "N/A",
            "output_format": "N/A"
        }}
        """
    
    try:
        chat_response = client.chat.complete(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = chat_response.choices[0].message.content.replace('```json', '').replace('```', '')
        return jsonify(json.loads(content))

    except Exception as e:
        print(f"❌ NEXT Q ERROR: {e}")
        return jsonify({"error": "Failed to generate next question"}), 500