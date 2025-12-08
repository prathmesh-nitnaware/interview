import React from "react";
import { useNavigate } from "react-router-dom";

const InterviewLive = () => {
  const navigate = useNavigate();

  // TODO: wire with backend / websocket later
  const currentQuestion =
    "Tell me about a challenging bug you encountered and how you resolved it.";

  return (
    <div className="interview-page">
      <div className="container interview-inner">
        {/* LEFT: question + notes */}
        <div className="interview-left">
          <div className="tag-pill">Live Mock Session</div>
          <h1>AI Mock Interview</h1>
          <p>
            Answer questions naturally while we track your communication,
            clarity, and structure. You’ll get a detailed breakdown at the end.
          </p>

          <div className="question-card">
            <h3>Current Question</h3>
            <p>{currentQuestion}</p>
            <ul className="question-bullets">
              <li>Explain context & impact.</li>
              <li>Walk through your debugging steps.</li>
              <li>Highlight tools, collaboration, and learning.</li>
            </ul>
          </div>

          <div className="interview-notes">
            <h4>Your Notes</h4>
            <textarea placeholder="Write key points or structure your answer in STAR format..." />
          </div>

          <div className="interview-bottom-actions">
            <button className="btn-ghost">⏭ Skip Question</button>
            <button
              className="btn-primary"
              onClick={() => navigate("/interview/report")}
            >
              End Session & View Report
            </button>
          </div>
        </div>

        {/* RIGHT: video + live stats */}
        <div className="interview-right">
          <div className="video-card">
            <div className="video-placeholder">
              <span>Webcam Preview (UI only for now)</span>
            </div>
            <div className="video-controls">
              <button className="btn-ghost">🎤 Mute</button>
              <button className="btn-ghost">📷 Camera</button>
              <button className="btn-primary">▶ Start / Pause</button>
            </div>
          </div>

          <div className="stats-card">
            <h3>Live Indicators (Mock)</h3>
            <div className="stat-row">
              <span>Confidence</span>
              <span>73%</span>
            </div>
            <div className="stat-row">
              <span>Filler Words</span>
              <span>Low</span>
            </div>
            <div className="stat-row">
              <span>Answer Length</span>
              <span>Good</span>
            </div>
            <div className="stat-row">
              <span>Clarity</span>
              <span>Strong</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewLive;
