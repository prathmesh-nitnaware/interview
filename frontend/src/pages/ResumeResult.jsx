import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Target, 
  Search, 
  ArrowRight,
  RefreshCw 
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../App.css';
import './ResumeResult.css'; // We will create this next

const ResumeResult = () => {
  const location = useLocation();
  const [resumeId, setResumeId] = useState(location.state?.resume_id || null);
  const [jobRole, setJobRole] = useState(location.state?.job_role || '');
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // If we came from Upload page with an ID but no results yet
  const handleScore = async (e) => {
    e?.preventDefault();
    if (!jobRole) return alert("Please enter a job role to score against.");
    
    setLoading(true);
    try {
      const data = await api.scoreResume(resumeId, jobRole);
      setResults(data);
    } catch (error) {
      console.error("Scoring failed", error);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!resumeId) {
    return (
      <div className="page-container flex-center flex-col">
        <h2 className="text-muted mb-4">No resume uploaded.</h2>
        <Link to="/resume/upload">
          <Button>Upload Resume</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container result-container animate-fade-in">
      
      {/* 1. INPUT SECTION (Visible if no results or re-scoring) */}
      {!results && (
        <Card className="score-setup-card">
          <h1 className="text-gradient mb-2">Resume ATS Scanner</h1>
          <p className="text-muted mb-6">Targeting a specific role? Let our AI match your keywords.</p>
          
          <form onSubmit={handleScore} className="score-form">
            <InputField 
              label="Target Job Title"
              name="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Full Stack Developer"
              icon={<Target size={18} />}
            />
            <Button type="submit" variant="primary" isLoading={loading} className="w-full">
              Calculate ATS Score <Search size={18} className="ml-2" />
            </Button>
          </form>
        </Card>
      )}

      {/* 2. LOADING STATE */}
      {loading && !results && (
        <div className="analysis-loader">
          <div className="neon-scanner-bar"></div>
          <p className="mt-4 text-gradient">Parsing keywords & metrics...</p>
        </div>
      )}

      {/* 3. RESULTS DASHBOARD */}
      {results && (
        <div className="results-grid animate-fade-in-up">
          
          {/* Top Row: Score & Header */}
          <div className="results-header">
            <div className="header-text">
              <h2>Analysis for <span className="text-primary">{jobRole}</span></h2>
              <p className="text-muted">Based on your uploaded document</p>
            </div>
            <Button variant="secondary" onClick={() => setResults(null)} icon={<RefreshCw size={16}/>}>
              Scan New Role
            </Button>
          </div>

          {/* Main Score Card */}
          <Card className="score-card-main">
            <div className="radial-score-large">
              <svg viewBox="0 0 36 36">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path 
                  className="circle-fill" 
                  strokeDasharray={`${results.score}, 100`} 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                />
              </svg>
              <div className="score-value">
                <span>{results.score}</span>
                <small>/100</small>
              </div>
            </div>
            <div className="score-verdict">
              <h3>{results.score >= 80 ? "Excellent Match" : results.score >= 60 ? "Good Potential" : "Needs Improvement"}</h3>
              <p className="text-muted">Your resume includes {results.score}% of the required keywords and formatting standards.</p>
            </div>
          </Card>

          {/* Missing Keywords */}
          <Card title="Missing Keywords" className="keywords-card">
            <div className="keywords-grid">
              {results.missing_keywords?.map((kw, i) => (
                <span key={i} className="keyword-chip missing">
                  <AlertTriangle size={14} /> {kw}
                </span>
              ))}
              {(!results.missing_keywords || results.missing_keywords.length === 0) && (
                <p className="text-success">All key terms found! 🎉</p>
              )}
            </div>
          </Card>

          {/* Feedback Columns */}
          <div className="feedback-split">
            <Card title="Strengths">
              <ul className="feedback-list">
                {results.strengths?.map((s, i) => (
                  <li key={i}><CheckCircle size={16} className="text-success" /> {s}</li>
                ))}
              </ul>
            </Card>

            <Card title="Fix These Issues">
              <ul className="feedback-list">
                {results.weaknesses?.map((w, i) => (
                  <li key={i}><XCircle size={16} className="text-danger" /> {w}</li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Action Plan */}
          <Card title="AI Suggestions" className="suggestions-card">
            <div className="suggestions-list">
              {results.suggestions?.map((s, i) => (
                <div key={i} className="suggestion-item">
                  <ArrowRight size={16} className="text-primary" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}
    </div>
  );
};

export default ResumeResult;