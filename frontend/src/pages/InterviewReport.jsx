import React from "react";

const InterviewReport = () => {
  // TODO: Replace mocks with real data later
  const overallScore = 76;
  const metrics = [
    { label: "Confidence", value: 72 },
    { label: "Structure (STAR)", value: 80 },
    { label: "Technical Depth", value: 78 },
    { label: "Communication Clarity", value: 82 },
  ];

  const strengths = [
    "Clearly explains context and impact.",
    "Good technical depth for core concepts.",
    "Keeps answers structured and easy to follow.",
  ];

  const improvements = [
    "Add more measurable results (numbers & impact).",
    "Slow down slightly to reduce rushing at the end.",
    "Use more specific examples for behavioral questions.",
  ];

  return (
    <div className="interview-report-page">
      <div className="container interview-report-inner">
        <div className="interview-report-header">
          <div>
            <div className="tag-pill">Session Summary</div>
            <h1>Interview Report</h1>
            <p>
              Here’s a breakdown of your latest mock interview. Use these
              insights to refine your stories and technical depth.
            </p>
          </div>
        </div>

        <div className="interview-report-grid">
          {/* Main score card */}
          <div className="report-main-card">
            <h3>Overall Interview Score</h3>
            <p className="report-main-score">{overallScore}%</p>
            <p className="report-main-sub">
              Solid performance. You&apos;re close to interview-ready — a bit
              more polish on examples and pacing will make a strong difference.
            </p>
          </div>

          {/* Metric breakdown */}
          <div className="report-metrics-card">
            <h3>Score Breakdown</h3>
            {metrics.map((m) => (
              <div key={m.label} className="metric-block">
                <div className="metric-row">
                  <span>{m.label}</span>
                  <span>{m.value}%</span>
                </div>
                <div className="metric-bar">
                  <div
                    className="metric-bar-fill"
                    style={{ width: `${m.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths */}
          <div className="report-strengths-card">
            <h3>Key Strengths</h3>
            <ul>
              {strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="report-improve-card">
            <h3>Areas to Improve</h3>
            <ul>
              {improvements.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>

          {/* Next steps */}
          <div className="report-next-card">
            <h3>Recommended Next Steps</h3>
            <ul>
              <li>
                Practice 2–3 more mock interviews focusing on behavioral
                answers.
              </li>
              <li>
                Revisit system design basics and prepare 1–2 go-to designs.
              </li>
              <li>Update your resume to reflect the best examples used here.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;
