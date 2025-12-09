import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  ArrowLeft,
  Activity,
  Zap,
  Brain
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import '../App.css';
import './InterviewReport.css';

const InterviewReport = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openQuestionIndex, setOpenQuestionIndex] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!sessionId) return;
      try {
        const data = await api.getReport(sessionId);
        setReport(data);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [sessionId]);

  const toggleAccordion = (index) => {
    setOpenQuestionIndex(openQuestionIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="page-container flex-center">
        <div className="neon-spinner-large"></div>
        <p className="mt-4 text-muted">Generating comprehensive analysis...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page-container flex-center flex-col">
        <h2 className="text-danger">Report Not Found</h2>
        <Link to="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Calculate generic score if missing (fallback)
  const score = report.overall_score || 0;
  const strokeDash = `${score}, 100`;

  return (
    <div className="page-container report-container animate-fade-in">
      
      {/* HEADER & SCORE */}
      <div className="report-header">
        <div className="header-left">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={20} /> Back to Dashboard
          </Link>
          <h1 className="report-title">Interview <span className="text-gradient">Analysis</span></h1>
          <p className="report-summary">{report.summary}</p>
        </div>
        
        <div className="score-circle-wrapper">
          <svg viewBox="0 0 36 36" className="score-svg">
            <path className="score-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path 
              className="score-fill" 
              strokeDasharray={strokeDash} 
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
            />
          </svg>
          <div className="score-text">
            <span className="score-number">{score}</span>
            <span className="score-label">/100</span>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="metrics-grid">
        <Card className="metric-box">
          <Activity size={24} className="metric-icon blue" />
          <h4>Clarity</h4>
          <div className="progress-bar">
            <div className="fill blue" style={{ width: `${report.clarity || 0}%` }}></div>
          </div>
          <span className="metric-number">{report.clarity}%</span>
        </Card>
        
        <Card className="metric-box">
          <Zap size={24} className="metric-icon purple" />
          <h4>Confidence</h4>
          <div className="progress-bar">
            <div className="fill purple" style={{ width: `${report.confidence || 0}%` }}></div>
          </div>
          <span className="metric-number">{report.confidence}%</span>
        </Card>
        
        <Card className="metric-box">
          <Brain size={24} className="metric-icon pink" />
          <h4>Tech Depth</h4>
          <div className="progress-bar">
            <div className="fill pink" style={{ width: `${report.technical_depth || 0}%` }}></div>
          </div>
          <span className="metric-number">{report.technical_depth}%</span>
        </Card>
      </div>

      {/* FEEDBACK COLUMNS */}
      <div className="feedback-section">
        <Card title="Strengths" className="feedback-card">
          <ul className="feedback-list success">
            {report.strengths?.map((item, i) => (
              <li key={i}><CheckCircle size={16} /> {item}</li>
            )) || <li>No specific strengths detected.</li>}
          </ul>
        </Card>

        <Card title="Areas for Improvement" className="feedback-card">
          <ul className="feedback-list warning">
            {report.weaknesses?.map((item, i) => (
              <li key={i}><XCircle size={16} /> {item}</li>
            )) || <li>No critical weaknesses detected.</li>}
          </ul>
        </Card>
      </div>

      {/* Q&A TRANSCRIPT ACCORDION */}
      <div className="transcript-section">
        <h2 className="section-header">Transcript & Analysis</h2>
        <div className="accordion-wrapper">
          {report.questions_and_answers?.map((qa, index) => (
            <div key={index} className={`accordion-item glass-card ${openQuestionIndex === index ? 'open' : ''}`}>
              
              <button className="accordion-trigger" onClick={() => toggleAccordion(index)}>
                <span className="question-text">Q{index + 1}: {qa.q}</span>
                {openQuestionIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              <div className="accordion-content">
                <div className="answer-block">
                  <h5>Your Answer:</h5>
                  <p>"{qa.a}"</p>
                </div>
                {qa.feedback && (
                  <div className="feedback-block">
                    <h5>AI Feedback:</h5>
                    <p className="text-gradient">{qa.feedback}</p>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="report-footer">
        <Button variant="primary" icon={<Download size={18}/>}>Download Report PDF</Button>
      </div>

    </div>
  );
};

export default InterviewReport;