from flask import Blueprint, request, jsonify
from utils.resume_parser import extract_text_from_file
import openai # Mocking the AI call

interview_bp = Blueprint('interview', __name__)

@interview_bp.route('/generate-question', methods=['POST'])
def generate_question():
    # 1. Check if file is uploaded or text is provided
    if 'resume' not in request.files:
        return jsonify({"error": "No resume uploaded"}), 400
        
    file = request.files['resume']
    
    # 2. Save temporarily to parse (or parse in memory)
    # For MVP, let's assume we save it temporarily
    file_path = f"./temp/{file.filename}"
    file.save(file_path)
    
    # 3. Use the Shared Parser
    resume_text = extract_text_from_file(file_path)
    
    # 4. Send to AI (Mocked here)
    # In reality, you send 'resume_text' to OpenAI/Gemini
    ai_prompt = f"Generate a coding problem based on this resume: {resume_text[:500]}..."
    
    generated_question = {
        "title": "API Rate Limiter (Based on your Flask exp)",
        "description": "Implement a decorator in Flask that limits requests...",
        "difficulty": "Medium"
    }
    
    return jsonify(generated_question)