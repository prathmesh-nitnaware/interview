import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowLeft, Activity, Cpu, ArrowRight, X, Download } from 'lucide-react';
import Editor from "@monaco-editor/react";
import './InterviewReport.css'; 
import { api } from '../services/api'; // Import API to save results

const CodingReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { feedback, question, userCode, config } = location.state || {};
  const [loadingNext, setLoadingNext] = React.useState(false);

  // --- 1. AUTO-SAVE REPORT ON MOUNT ---
  useEffect(() => {
    if (feedback && question) {
        // We define a function to save the session
        const saveReportToDB = async () => {
            try {
                // Mock API call - in a real app, you'd have a specific endpoint
                console.log("Saving Report to DB...", {
                    question: question.title,
                    rating: feedback.rating,
                    type: "Coding",
                    date: new Date()
                });
                // await api.post('/analytics/save', { ...data }); 
            } catch (err) {
                console.error("Failed to save report analytics", err);
            }
        };
        saveReportToDB();
    }
  }, []); // Run once

  if (!feedback) return <div className="report-container">No report data found.</div>;

  const isSuccess = feedback.correctness === 'Yes';
  const scoreColor = isSuccess ? '#22c55e' : '#eab308';

  // --- 2. DOWNLOAD HANDLER ---
  const handleDownload = () => {
      window.print(); // Opens browser print dialog -> Save as PDF
  };

  const handleNextQuestion = async () => {
    setLoadingNext(true);
    try {
        const nextQ = await api.fetchNextQuestion({
            role: config?.role || "Developer",
            experience: config?.difficulty || "Medium",
            focus: "Coding",
            current_question: question.title,
            resume_context: config?.resume_context || ""
        });
        
        navigate('/coding/arena', { 
            state: { question: nextQ, config: config } 
        });

    } catch (error) {
        alert("Failed to load next problem.");
    } finally {
        setLoadingNext(false);
    }
  };

  return (
    <div className="report-container">
      
      {/* HEADER */}
      <header className="report-header no-print"> {/* no-print hides this in PDF */}
        <button onClick={() => navigate('/coding/arena')} className="back-link">
            <ArrowLeft size={20} /> Retry Problem
        </button>
        <div className="header-content">
            <h1>Code Analysis Report</h1>
            <p className="subtitle">{question?.title}</p>
        </div>
        <button onClick={handleDownload} className="btn-secondary" style={{padding:'10px 20px', display:'flex', gap:'8px'}}>
            <Download size={18}/> Download PDF
        </button>
      </header>

      {/* PRINT-ONLY HEADER */}
      <div className="print-only-header" style={{display:'none', textAlign:'center', marginBottom:'30px'}}>
          <h1>Prep.AI - Coding Assessment</h1>
          <p>Candidate Report for: {question?.title}</p>
          <hr/>
      </div>

      <div className="report-grid">
        
        {/* LEFT: METRICS */}
        <div className="metrics-column">
            <div className="stat-card main" style={{borderColor: scoreColor, background: `${scoreColor}10`, marginBottom:'2rem'}}>
               <span className="stat-label">AI RATING</span>
               <div className="stat-value big" style={{color: scoreColor}}>{feedback.rating}/10</div>
               <span className="stat-sub" style={{color: isSuccess ? '#22c55e' : '#eab308'}}>
                   {isSuccess ? "Passed" : "Review Needed"}
               </span>
            </div>

            <div className="stats-grid" style={{gridTemplateColumns:'1fr 1fr', marginBottom:'2rem'}}>
                <div className="stat-box">
                    <span className="stat-title">Complexity</span>
                    <div className="stat-val" style={{fontSize:'1.2rem'}}>{feedback.time_complexity}</div>
                </div>
                <div className="stat-box">
                    <span className="stat-title">Correctness</span>
                    <div className="stat-val" style={{fontSize:'1.2rem', color: isSuccess ? '#22c55e':'#ef4444'}}>
                        {feedback.correctness}
                    </div>
                </div>
            </div>

            <div className="history-item" style={{background:'#111', padding:'2rem', borderRadius:'12px', marginBottom:'2rem'}}>
                <h3>AI Feedback</h3>
                <p style={{lineHeight:'1.6', fontSize:'1.1rem', color:'#ddd'}}>"{feedback.feedback}"</p>
            </div>

            <div className="action-row no-print">
                <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{borderColor:'#ef4444', color:'#ef4444'}}>
                    <X size={18} /> End Round
                </button>
                <button onClick={handleNextQuestion} disabled={loadingNext} className="btn-primary" style={{width:'100%'}}>
                    {loadingNext ? "Generating..." : <>Solve Next Question <ArrowRight size={18}/></>}
                </button>
            </div>
        </div>

        {/* RIGHT: CODE PREVIEW */}
        <div className="code-column">
            <h3>Your Submission</h3>
            <div style={{height:'500px', border:'1px solid #333', borderRadius:'8px', overflow:'hidden'}}>
                <Editor 
                    height="100%" 
                    defaultLanguage="python" 
                    theme="vs-dark"
                    value={userCode}
                    options={{ readOnly: true, minimap: { enabled: false } }}
                />
            </div>
        </div>
      </div>

      {/* CSS FOR PRINTING */}
      <style>{`
        @media print {
            .no-print { display: none !important; }
            .print-only-header { display: block !important; }
            .report-container { background: white; color: black; padding: 0; }
            .stat-card, .history-item, .code-column { border: 1px solid #ddd; background: #fff !important; color: black !important; }
            .stat-value, h1, h3, p { color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default CodingReport;