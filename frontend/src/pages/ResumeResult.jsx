import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Check, X, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../styles/theme.css';
import './ResumeResult.css';

const ResumeResult = () => {
  const location = useLocation();
  const [resumeId] = useState(location.state?.resume_id || null);
  const [jobRole, setJobRole] = useState(location.state?.job_role || '');
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleScore = async (e) => {
    e?.preventDefault();
    if (!jobRole) return alert("Enter a target role.");
    
    setLoading(true);
    try {
      const data = await api.scoreResume(resumeId, jobRole);
      setResults(data);
    } catch (error) {
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!resumeId) {
    return (
      <div className="result-empty page-container">
        <h1>NO DATA FOUND</h1>
        <Link to="/resume/upload" className="link-editorial">UPLOAD RESUME</Link>
      </div>
    );
  }

  return (
    <div className="result-root page-container">
      
      {/* HEADER */}
      <div className="result-header">
        <span className="text-mono">03 // ANALYSIS RESULTS</span>
        <h1 className="result-title">ATS AUDIT REPORT</h1>
      </div>

      {/* INPUT SECTION */}
      {!results && (
        <div className="result-setup">
          <Card className="card-editorial">
            <h3 className="section-title">TARGET PARAMETERS</h3>
            <form onSubmit={handleScore} className="setup-form">
              <InputField 
                label="JOB TITLE"
                name="jobRole"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="E.G. FULL STACK DEVELOPER"
              />
              <Button type="submit" variant="primary" isLoading={loading} className="btn-editorial primary w-full mt-4">
                RUN DIAGNOSTIC
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* LOADING */}
      {loading && !results && (
        <div className="loader-container">
          <div className="loader-bar"></div>
          <p className="text-mono">PROCESSING DOCUMENT STRUCTURE...</p>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {results && (
        <div className="report-grid fade-in-up">
          
          {/* Main Score */}
          <div className="score-section">
            <div className="score-box">
              <span className="score-label">MATCH SCORE</span>
              <span className="score-huge">{results.score}</span>
              <span className="score-total">/ 100</span>
            </div>
            <div className="score-actions">
              <Button variant="secondary" onClick={() => setResults(null)} className="btn-editorial">
                <RefreshCw size={14} /> NEW SCAN
              </Button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="details-grid">
            
            {/* Missing Keywords */}
            <Card className="card-editorial">
              <h3 className="section-title">MISSING KEYWORDS</h3>
              <div className="tags-container">
                {results.missing_keywords?.map((kw, i) => (
                  <span key={i} className="tag-editorial alert">{kw}</span>
                )) || <span className="text-mono text-muted">NO CRITICAL GAPS DETECTED</span>}
              </div>
            </Card>

            {/* Strengths */}
            <Card className="card-editorial">
              <h3 className="section-title">DETECTED STRENGTHS</h3>
              <ul className="list-editorial success">
                {results.strengths?.map((s, i) => (
                  <li key={i}><Check size={16} /> {s}</li>
                ))}
              </ul>
            </Card>

            {/* Weaknesses */}
            <Card className="card-editorial">
              <h3 className="section-title">CRITICAL ISSUES</h3>
              <ul className="list-editorial danger">
                {results.weaknesses?.map((w, i) => (
                  <li key={i}><X size={16} /> {w}</li>
                ))}
              </ul>
            </Card>

            {/* Suggestions */}
            <Card className="card-editorial full-width">
              <h3 className="section-title">OPTIMIZATION STRATEGY</h3>
              <div className="suggestions-list">
                {results.suggestions?.map((s, i) => (
                  <div key={i} className="suggestion-row">
                    <ArrowRight size={16} />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeResult;