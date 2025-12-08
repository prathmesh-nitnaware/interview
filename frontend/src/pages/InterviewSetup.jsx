import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "Software Engineer",
    experience: "0-1 years",
    interviewType: "Technical",
    difficulty: "Medium",
    questionCount: 8,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStart = (e) => {
    e.preventDefault();
    console.log("Interview settings:", form);
    // TODO: pass settings to backend
    navigate("/interview/live");
  };

  return (
    <div className="interview-setup-page">
      <div className="container interview-setup-inner">
        <div className="interview-setup-left">
          <div className="tag-pill">AI Mock Interview</div>
          <h1>Configure Your Interview</h1>
          <p>
            Choose your target role, experience level, and interview style. Our
            AI will generate questions that match real interview patterns.
          </p>

          <form className="interview-setup-form" onSubmit={handleStart}>
            <div className="form-row">
              <label>Target Role</label>
              <input
                name="role"
                className="glass-input"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g., Backend Engineer"
              />
            </div>

            <div className="form-row">
              <label>Experience Level</label>
              <select
                name="experience"
                className="glass-input"
                value={form.experience}
                onChange={handleChange}
              >
                <option>0-1 years</option>
                <option>1-3 years</option>
                <option>3-6 years</option>
                <option>6+ years</option>
              </select>
            </div>

            <div className="form-row two-col">
              <div>
                <label>Interview Type</label>
                <select
                  name="interviewType"
                  className="glass-input"
                  value={form.interviewType}
                  onChange={handleChange}
                >
                  <option>Technical</option>
                  <option>HR / Behavioral</option>
                  <option>System Design</option>
                </select>
              </div>
              <div>
                <label>Difficulty</label>
                <select
                  name="difficulty"
                  className="glass-input"
                  value={form.difficulty}
                  onChange={handleChange}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <label>Number of Questions</label>
              <input
                name="questionCount"
                type="number"
                className="glass-input"
                min={3}
                max={15}
                value={form.questionCount}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-primary btn-large glow">
              Start Interview →
            </button>
          </form>
        </div>

        <div className="interview-setup-right">
          <div className="setup-preview-card">
            <h3>Session Preview</h3>
            <p className="setup-sub">
              AI interviewer: <strong>Structured technical + behavioral flow</strong>
            </p>
            <ul className="dash-list">
              <li>Intro + profile questions</li>
              <li>Role-specific technical questions</li>
              <li>1–2 behavioral questions (STAR)</li>
              <li>Summary + feedback</li>
            </ul>

            <div className="setup-chip-row">
              <span className="keyword-chip">Real-time feedback</span>
              <span className="keyword-chip">Confidence tracking</span>
              <span className="keyword-chip">Question difficulty mix</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
