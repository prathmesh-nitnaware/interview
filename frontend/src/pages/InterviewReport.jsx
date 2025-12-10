import React, { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import '../styles/theme.css';
import './InterviewReport.css';

const InterviewReport = () => {
  // Mock Data
  const report = {
    score: 85,
    breakdown: [
      { label: "CLARITY", val: 88 },
      { label: "CONFIDENCE", val: 82 },
      { label: "TECHNICAL", val: 85 },
    ],
    feedback: "Strong performance. Good use of resume context."
  };

  return (
    <div className="report-root page-container">
      <div className="report-header">
        <h1 className="report-title">SESSION REPORT</h1>
        <Button variant="secondary" className="btn-editorial">
          <Download size={14} /> EXPORT PDF
        </Button>
      </div>

      <div className="report-layout">
        {/* Score Card */}
        <Card className="score-card-editorial">
          <span className="text-mono">OVERALL SCORE</span>
          <div className="big-score">{report.score}</div>
        </Card>

        {/* Metrics */}
        <div className="metrics-column">
          {report.breakdown.map((m, i) => (
            <div key={i} className="metric-row">
              <span className="metric-label">{m.label}</span>
              <div className="metric-bar-bg">
                <div className="metric-bar-fill" style={{width: `${m.val}%`}}></div>
              </div>
              <span className="metric-val">{m.val}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Transcript Placeholder */}
      <div className="transcript-section">
        <h3 className="section-title">TRANSCRIPT ANALYSIS</h3>
        <div className="transcript-item">
          <div className="transcript-q">Q: TELL ME ABOUT YOURSELF</div>
          <div className="transcript-a">Candidate response text...</div>
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;