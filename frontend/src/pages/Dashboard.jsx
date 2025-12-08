import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <div className="container dashboard-inner">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              ATS scores, interview performance, and improvement insights in one
              place.
            </p>
          </div>
          <div className="dashboard-header-actions">
            <button
              className="btn-ghost"
              onClick={() => navigate("/resume")}
            >
              Upload Resume
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/interview/setup")}
            >
              Start Interview
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card">
            <h3>Overall Readiness</h3>
            <p className="dash-score">78%</p>
            <p className="dash-sub">Based on your last 5 interviews</p>
          </div>

          <div className="dash-card">
            <h3>Latest ATS Score</h3>
            <p className="dash-score">84</p>
            <p className="dash-sub">Good match for Backend Engineer roles</p>
          </div>

          <div className="dash-card">
            <h3>Focus Areas</h3>
            <ul className="dash-list">
              <li>Behavioral storytelling (STAR)</li>
              <li>System design depth</li>
              <li>Reducing filler words</li>
            </ul>
          </div>

          <div className="dash-card dash-wide">
            <h3>Recent Activity</h3>
            <div className="session-row">
              <span>Mock Interview – SDE 1</span>
              <span>Score: 80%</span>
            </div>
            <div className="session-row">
              <span>ATS Resume Scan – Backend</span>
              <span>Score: 84</span>
            </div>
            <div className="session-row">
              <span>Mock Interview – HR Round</span>
              <span>Score: 75%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
