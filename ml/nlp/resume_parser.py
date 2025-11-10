import spacy
import PyPDF2
import re
import json
import os
from spacy.matcher import Matcher

# Import your ollama client
from backend.ollama_client import generate_response

# Load spaCy NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except IOError:
    print("Error: 'en_core_web_sm' model not found. ")
    print("Please run: python -m spacy download en_core_web_sm")
    nlp = None

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file.
    Returns: Extracted text as a string.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found at {pdf_path}")
        
    text = ""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            if page.extract_text():
                text += page.extract_text()
    return text

def parse_resume_with_spacy(text):
    """
    Parse resume text using spaCy to extract entities.
    This is a FALLBACK for when the LLM fails.
    """
    if not nlp:
        print("spaCy model not loaded, cannot parse.")
        return {}
        
    doc = nlp(text)

    # --- A simple skill matcher ---
    skill_matcher = Matcher(nlp.vocab)
    skill_patterns = [
        [{'LOWER': 'python'}],
        [{'LOWER': 'java'}],
        [{'LOWER': 'javascript'}],
        [{'LOWER': 'react'}],
        [{'LOWER': 'fastapi'}],
        [{'LOWER': 'opencv'}],
        [{'LOWER': 'tensorflow'}],
        [{'LOWER': 'pytorch'}],
        [{'LOWER': 'machine'}, {'LOWER': 'learning'}]
    ]
    skill_matcher.add("SKILLS", skill_patterns)
    
    matches = skill_matcher(doc)
    skills = [doc[start:end].text for match_id, start, end in matches]

    # --- Extract experience (look for organizations) ---
    experience = [ent.text for ent in doc.ents if ent.label_ == "ORG"]

    # --- Extract education (look for 'University' or 'College') ---
    education = []
    for token in doc:
        if token.text.lower() in ['university', 'college', 'msc', 'bsc']:
            if token.sent.text not in education:
                education.append(token.sent.text)

    return {
        "skills": list(set(skills)),  # Remove duplicates
        "experience": list(set(experience)),
        "education": list(set(education)),
    }

def parse_resume_with_ollama(text):
    """
    Parse resume text using Ollama (Mistral) for structured extraction.
    Returns: Dictionary of extracted information.
    """
    prompt = f"""
    You are an expert resume parser. Extract the following information from the resume text below.
    Return ONLY a valid JSON object with the keys "skills", "experience", and "education".
    - "skills": A list of technical skills (e.g., Python, React, AWS).
    - "experience": A list of strings, each string containing a job title and company (e.g., "Software Engineer at Google").
    - "education": A list of strings, each string containing a degree and institution (e.g., "MSc in Computer Science at Stanford").

    Resume Text:
    ---
    {text}
    ---
    
    JSON Output:
    """
    response = generate_response(prompt)

    # Extract the JSON from the LLM's chatty response
    json_match = re.search(r'\{.*\}', response, re.DOTALL)
    
    if not json_match:
        print("Warning: Ollama did not return valid JSON. Falling back to spaCy.")
        return parse_resume_with_spacy(text)

    try:
        json_string = json_match.group(0)
        extracted_data = json.loads(json_string)
        
        # Ensure the keys are present
        if "skills" not in extracted_data: extracted_data["skills"] = []
        if "experience" not in extracted_data: extracted_data["experience"] = []
        if "education" not in extracted_data: extracted_data["education"] = []
            
        return extracted_data
    except json.JSONDecodeError:
        print("Warning: Ollama response was not valid JSON. Falling back to spaCy.")
        return parse_resume_with_spacy(text)

def parse_resume(pdf_path=None, text=None):
    """
    Parse a resume (PDF or text) and extract structured information.
    Returns: Dictionary of extracted data.
    """
    if pdf_path:
        text = extract_text_from_pdf(pdf_path)
    elif not text:
        raise ValueError("Provide either a PDF path or resume text.")

    # Use Ollama for structured extraction (fallback to spaCy)
    return parse_resume_with_ollama(text)