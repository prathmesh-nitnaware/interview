import requests
import json
import re
from typing import List, Dict # Added for type hinting

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_response(prompt: str, model: str = "mistral") -> str:
    """
    Send a prompt to Ollama's model and return the response.
    (This is for simple text, not JSON)
    """
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3 # Lower temperature for more predictable, professional responses
        }
    }
    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        # Clean up the response, remove newlines and leading/trailing spaces
        clean_response = response.json().get("response", "").strip()
        return clean_response
    except requests.exceptions.RequestException as e:
        print(f"Error calling Ollama: {e}")
        return ""

def evaluate_answer(question: str, answer: str) -> float:
    """
    Evaluate an interview answer using Mistral.
    Returns a score between 0 and 1.
    """
    prompt = f"""
    You are an expert technical interviewer. Your only job is to evaluate the following answer to the given question
    on a scale of 0.0 to 1.0 based on its technical accuracy, depth, and clarity.
    
    Question: {question}
    Answer: {answer}
    
    Provide ONLY the score as a single float (e.g., 0.85) and absolutely no other text.
    Score:
    """
    score_str = generate_response(prompt).replace('"', '').strip() # Clean up response
    
    # Try to find a float in the response
    match = re.search(r"(\d\.\d+)", score_str)
    
    try:
        if match:
            return float(match.group(1))
        else:
            # Try to convert the whole string, in case it's just "0.8"
            return float(score_str)
    except (ValueError, TypeError):
        print(f"Warning: Could not parse score from Ollama response: '{score_str}'")
        return 0.5  # Default score if parsing fails

# --- DELETED get_interview_followup() function ---
# We are no longer doing turn-by-turn feedback.

# --- NEW, UPGRADED FUNCTION ---
def generate_question_list(skills: list, experience: list, difficulty: str, num_questions: int) -> List[str]:
    """
    Generate a *list* of interview questions based on user preferences.
    """
    skills_str = ", ".join(skills)
    experience_str = "\n- ".join(experience)
    
    prompt = f"""
    You are a senior technical interviewer for a FAANG-level company.
    The candidate's profile is:
    - Skills: {skills_str}
    - Experience: {experience_str}
    
    Your task is to generate a list of exactly **{num_questions}** personalized, high-quality interview questions.
    The difficulty for these questions must be **"{difficulty}"**.
    The questions should be conversational and based on the candidate's skills.

    Return ONLY a valid JSON array (a Python list) of strings, where each string is one question.
    
    Example response for num_questions=2:
    ["I see you have experience with both FastAPI and OpenCV. Can you describe a project where you used them together?", "Given your skill in Python, how would you approach optimizing a slow database query?"]

    Return ONLY the valid JSON array and no other text.
    JSON:
    """
    
    raw_response = generate_response(prompt)
    
    # Find the JSON array (starts with [)
    json_match = re.search(r'\[.*\]', raw_response, re.DOTALL)
    
    if not json_match:
        print("Warning: Could not find JSON list in LLM response.")
        return ["Tell me about a project you're proud of."] # Fallback

    try:
        json_string = json_match.group(0)
        question_list = json.loads(json_string)
        
        # Make sure it's a list of strings
        if not isinstance(question_list, list) or not all(isinstance(q, str) for q in question_list):
            raise json.JSONDecodeError("Not a list of strings", json_string, 0)
            
        return question_list
        
    except json.JSONDecodeError:
        print("Warning: LLM response was not a valid JSON list.")
        # Fallback: try to grab lines as questions
        questions = [line.strip().replace('"', '').replace(',', '') for line in raw_response.split('\n') if len(line) > 10]
        if questions:
            return questions[:num_questions]
        return ["Tell me about your experience with Python."] # Final fallback

# --- CODING CHALLENGE FUNCTIONS (NO CHANGE) ---

def get_coding_problem(skills: list) -> Dict[str, str]:
    """
    Generates a coding problem based on the user's skills.
    Returns JSON with title and description.
    """
    skills_str = ", ".join(skills)
    
    prompt = f"""
    You are a technical interviewer. You need to generate a coding challenge
    for a candidate with these skills: {skills_str}.
    
    Generate ONE "medium" difficulty coding problem (like a LeetCode problem).
    
    Return ONLY a valid JSON object with two keys:
    1. "title": A short, clear title (e.g., "Find First Non-Repeating Character").
    2. "description": A 2-3 sentence description of the problem, including an example.
    
    Example response format:
    {{"title": "Two Sum Problem", "description": "Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to 'target'. Example: nums = [2, 7, 11, 15], target = 9, Output: [0, 1]"}}

    Return ONLY the valid JSON object and no other text.
    JSON:
    """
    
    raw_response = generate_response(prompt)
    json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)
    
    if not json_match:
        print("Warning: Could not find JSON in coding problem response.")
        return {"title": "Error", "description": "Could not generate a problem. Please try again."}

    try:
        json_string = json_match.group(0)
        return json.loads(json_string)
    except json.JSONDecodeError:
        print("Warning: LLM response for coding problem was not valid JSON.")
        return {"title": "Error", "description": "Could not generate a problem. Please try again."}

def evaluate_code_solution(problem_description: str, user_code: str) -> str:
    """
    Generates a "FAANG Engineer" style code review for a given solution.
    Returns the review as a single string.
    """
    prompt = f"""
    You are a Senior FAANG Engineer doing a live, constructive code review.
    
    The problem was:
    "{problem_description}"
    
    The candidate's solution is:
    ---
    {user_code}
    ---
    
    Your task is to provide a concise, 3-point review.
    1. **Correctness:** Does this logic solve the problem?
    2. **Efficiency:** What is the Time and Space Complexity (Big O) of this solution?
    3. **Suggestion:** What is one single, actionable way to improve this code (e.g., for clarity, efficiency, or to fix a bug)?
    
    Format your response as a single string with markdown.
    
    Example:
    "**Correctness:** The logic is 90% there, but it fails on an edge case with an empty array.
    **Efficiency:** This is an O(n^2) solution because of the nested loops.
    **Suggestion:** You can optimize this to O(n) by using a hash map to store seen values."

    Return ONLY the review and no other text.
    
    Review:
    """
    
    review_text = generate_response(prompt)
    
    # Clean up the response
    if review_text.lower().startswith("review:"):
        review_text = review_text[7:].strip()
        
    return review_text