import React from "react";

const ResumeResult = () => {
  const sampleScore = 78;

  const strengths = [
    "Clear formatting with proper section spacing",
    "Strong technical skills relevant to job role",
    "Uses measurable achievements",
  ];

  const weaknesses = [
    "Missing role-specific keywords",
    "Profile summary too generic",
    "Project descriptions lack impact verbs",
  ];

  const missingKeywords = [
    "REST APIs",
    "Team Collaboration",
    "Agile",
    "System Design",
    "Unit Testing",
  ];

  const improvements = [
    "Rewrite the summary using a stronger leadership-focused structure.",
    "Add role-aligned skills and frameworks.",
    "Include measurable outcomes in projects.",
    "Improve readability by standardizing fonts and weights.",
  ];

  return (
    <div className="ats-result-page container fade-in-up delay-1" style={{ paddingTop: "140px", paddingBottom: "60px" }}>

      {/* ---------------- ATS SCORE CARD ---------------- */}
      <div className="ats-main-card fade-in-up delay-2">
        <h2 className="ats-title">Resume ATS Score</h2>

        <div className="ats-score-wrapper">
          <div className="ats-score-circle">
            <svg className="progress-ring" width="150" height="150">
              <circle
                className="progress-ring-bg"
                cx="75"
                cy="75"
                r="60"
              />
              <circle
                className="progress-ring-fill"
                cx="75"
                cy="75"
                r="60"
                style={{
                  strokeDashoffset: `calc(377 - (377 * ${sampleScore}) / 100)`
                }}
              />
            </svg>
            <div className="ats-score-text">
              <h1>{sampleScore}</h1>
              <span>Score</span>
            </div>
          </div>

          <p className="ats-subtext">
            Your resume ranks <strong>{sampleScore}%</strong> optimized for Applicant
            Tracking Systems based on structure, keywords, clarity, and job match.
          </p>
        </div>
      </div>

      {/* ---------------- KEYWORDS MATCH ---------------- */}
      <div className="ats-card fade-in-up delay-3">
        <h3>Missing Important Keywords</h3>

        <div className="keyword-list">
          {missingKeywords.map((key, i) => (
            <span key={i} className="keyword-chip">{key}</span>
          ))}
        </div>
      </div>

      {/* ---------------- STRENGTHS ---------------- */}
      <div className="ats-cards-grid fade-in-up delay-4">
        <div className="ats-card">
          <h3>Strengths</h3>
          <ul className="ats-list">
            {strengths.map((s, i) => (
              <li key={i}>✔ {s}</li>
            ))}
          </ul>
        </div>

        {/* ---------------- WEAKNESSES ---------------- */}
        <div className="ats-card">
          <h3>Weaknesses</h3>
          <ul className="ats-list">
            {weaknesses.map((w, i) => (
              <li key={i}>✘ {w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---------------- IMPROVEMENTS LIST ---------------- */}
      <div className="ats-card fade-in-up delay-5">
        <h3>Recommended Improvements</h3>

        <ul className="ats-list">
          {improvements.map((imp, i) => (
            <li key={i}>• {imp}</li>
          ))}
        </ul>

        <button className="btn-primary btn-large glow" style={{ marginTop: "20px" }}>
          Generate Improved Resume →
        </button>
      </div>

    </div>
  );
};

export default ResumeResult;
