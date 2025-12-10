const API_BASE = "http://localhost:8000/api";

const handleResponse = async (res) => {
  if (!res.ok) throw new Error("API Error");
  return res.json();
};

export const api = {
  // User Profile
  getUserProfile: async (userId) => {
    const res = await fetch(`${API_BASE}/user/${userId}`);
    return handleResponse(res);
  },
  
  updateUserProfile: async (userId, data) => {
    const res = await fetch(`${API_BASE}/user/update/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Dashboard
  getDashboard: async (userId) => {
    const res = await fetch(`${API_BASE}/dashboard/${userId}`);
    return handleResponse(res);
  },

  // Resume
  uploadResume: async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/resume/upload`, { method: "POST", body: fd });
    return handleResponse(res);
  },

  // Interview
  startInterview: async (role, experience, type, count, resumeText, userId) => {
    const res = await fetch(`${API_BASE}/interview/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        role, experience, interview_type: type, 
        question_count: count, resume_context: resumeText,
        user_id: userId
      }),
    });
    return handleResponse(res);
  }
};