import httpx
import json
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self, base_url="http://localhost:11434", model="llama3"):
        """
        Initialize the Ollama Client.
        Ensure you have Ollama running: `ollama run llama3`
        """
        self.base_url = f"{base_url}/api/generate"
        self.model = model
        self.headers = {"Content-Type": "application/json"}

    async def _send_request(self, prompt: str, json_mode: bool = False):
        """
        Helper method to send async requests to Ollama.
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
        }
        
        if json_mode:
            payload["format"] = "json"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.base_url, 
                    json=payload, 
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                return data.get("response", "")
            except Exception as e:
                logger.error(f"Ollama Connection Error: {e}")
                return None

    async def generate_question(self, role: str, experience: str, history: list):
        """
        Generates the next interview question based on chat history.
        """
        context_str = "\n".join([f"Q: {h['q']}\nA: {h['a']}" for h in history])
        
        prompt = f"""
        You are a strict technical interviewer engaging in a voice interview.
        Role: {role}
        Experience Level: {experience}
        
        Current Interview History:
        {context_str}
        
        Task: Generate ONE concise, challenging follow-up question based on the candidate's previous answer. 
        If there is no history, ask a standard opening question for this role.
        Do not include "Here is a question" or polite filler. Just the question.
        """
        
        response = await self._send_request(prompt)
        return response.strip() if response else "Tell me about your experience with this role."

    async def analyze_answer(self, question: str, answer: str):
        """
        Analyzes the user's answer for clarity, confidence (implied), and technical correctness.
        Returns a JSON object.
        """
        prompt = f"""
        Analyze the following interview response.
        
        Question: "{question}"
        Candidate Answer: "{answer}"
        
        Return ONLY a JSON object (no extra text) with this format:
        {{
            "clarity": <int 0-100>,
            "confidence": <int 0-100>,
            "feedback": "<one sentence feedback>",
            "suggestions": ["<suggestion 1>", "<suggestion 2>"]
        }}
        """
        
        response = await self._send_request(prompt, json_mode=True)
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback if LLM fails to generate valid JSON
            return {
                "clarity": 70,
                "confidence": 70,
                "feedback": "Analysis failed to parse.",
                "suggestions": ["Speak clearly", "Elaborate more"]
            }

    async def parse_resume(self, resume_text: str, job_role: str):
        """
        ATS Logic: Scores a resume against a job role.
        """
        prompt = f"""
        Act as an ATS (Applicant Tracking System) expert.
        Job Role: {job_role}
        Resume Text:
        {resume_text[:3000]}  # Truncate to avoid context limit if necessary
        
        Return ONLY a JSON object with this exact structure:
        {{
            "score": <int 0-100>,
            "missing_keywords": ["<keyword1>", "<keyword2>"],
            "strengths": ["<strength1>", "<strength2>"],
            "weaknesses": ["<weakness1>", "<weakness2>"],
            "summary": "<short summary of fit>"
        }}
        """
        
        response = await self._send_request(prompt, json_mode=True)
        
        try:
            return json.loads(response)
        except Exception:
            return {
                "score": 50,
                "missing_keywords": ["Error parsing resume"],
                "strengths": [],
                "weaknesses": [],
                "summary": "AI could not process this file."
            }

# Singleton instance for import
ollama_service = OllamaClient()