const API_BASE = "http://localhost:8000/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Something went wrong");
  }
  return response.json();
};

export const api = {
  // 1. Upload Resume
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE}/resume/upload`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(response);
  },

  // 2. Score Resume
  scoreResume: async (resumeId, jobRole) => {
    const response = await fetch(`${API_BASE}/resume/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_id: resumeId, job_role: jobRole }),
    });
    return handleResponse(response);
  },

  // 3. Start Interview (Updated with count & resume text)
  startInterview: async (role, experience, type, questionCount, resumeText) => {
    const response = await fetch(`${API_BASE}/interview/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        role, 
        experience, 
        interview_type: type,
        question_count: questionCount,
        resume_context: resumeText 
      }),
    });
    return handleResponse(response);
  },

  // 4. Get Report
  getReport: async (sessionId) => {
    const response = await fetch(`${API_BASE}/interview/report/${sessionId}`);
    return handleResponse(response);
  },

  // 5. Dashboard
  getDashboard: async (userId) => {
    const response = await fetch(`${API_BASE}/dashboard/${userId}`);
    return handleResponse(response);
  }
};