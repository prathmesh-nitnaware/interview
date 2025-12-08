import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResumeUpload = () => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleAnalyze = () => {
    // TODO: send to backend; for now just navigate
    navigate("/resume/result");
  };

  return (
    <div className="resume-page">
      <div className="container resume-inner">
        <div className="resume-left">
          <div className="tag-pill">Resume Intelligence</div>
          <h1>Upload Your Resume</h1>
          <p>
            We’ll analyze your resume against ATS criteria, role keywords, and
            industry standards to give you a clear, actionable score.
          </p>

          <ul className="resume-list">
            <li>ATS compatibility score and keyword match.</li>
            <li>Strengths, weaknesses, and missing sections.</li>
            <li>Suggestions for better targeting your dream role.</li>
          </ul>
        </div>

        <div className="resume-right">
          <div className="resume-card">
            <h3>Resume Upload</h3>
            <p className="resume-sub">
              Upload a PDF or DOCX file to start the ATS analysis.
            </p>

            <label className="file-drop">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                hidden
                onChange={handleFileChange}
              />
              <span>Click to browse or drop your resume here</span>
            </label>

            {fileName && (
              <p className="file-name">Selected file: {fileName}</p>
            )}

            <button
              className="btn-primary full"
              onClick={handleAnalyze}
              disabled={!fileName}
              style={{ opacity: fileName ? 1 : 0.5 }}
            >
              Analyze with ATS (Mock)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
