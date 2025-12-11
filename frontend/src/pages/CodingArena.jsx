import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Editor from "@monaco-editor/react";
import { api } from '../services/api';
import { ArrowLeft, Play } from 'lucide-react';
import './InterviewLive.css'; 

const CodingArena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get Question AND Config
  const question = location.state?.question || {
      title: "Loading...", description: "Initializing...", input_format: "", output_format: ""
  };
  const config = location.state?.config || {}; // <--- Vital for fetching next question

  const [code, setCode] = useState(`
# Write your solution here
# Problem: ${question.title}

def solve():
    pass
`);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.submitCode({
        code: code,
        question_title: question.title,
        mode: "code" 
      });
      
      // Navigate to Report with ALL necessary data
      navigate('/coding/report', { 
        state: { 
            feedback: response.review, 
            question: question,
            userCode: code,
            config: config // <--- Pass this forward
        } 
      });

    } catch (error) {
      alert("Submission failed. Check console.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="live-container">
      {/* LEFT PANEL */}
      <div className="question-panel" style={{width: '35%'}}>
        <div className="panel-header">
           <button onClick={() => navigate('/dashboard')} className="back-btn"><ArrowLeft size={16}/> Quit</button>
        </div>
        
        <h1 className="problem-title">{question.title}</h1>
        <div className="desc-box"><p>{question.description}</p></div>

        <div className="io-section" style={{background:'#111', padding:'1rem', borderRadius:'8px', marginTop:'2rem'}}>
             <h3 style={{color:'#666', fontSize:'0.8rem', marginBottom:'10px'}}>INPUT FORMAT</h3>
             <code style={{color:'#22c55e'}}>{question.input_format || "N/A"}</code>
             <h3 style={{color:'#666', fontSize:'0.8rem', margin:'20px 0 10px'}}>OUTPUT FORMAT</h3>
             <code style={{color:'#3b82f6'}}>{question.output_format || "N/A"}</code>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="editor-panel" style={{width: '65%', display:'flex', flexDirection:'column'}}>
        <Editor 
          height="85vh" 
          defaultLanguage="python" 
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val)}
          options={{ minimap: { enabled: false }, fontSize: 14 }}
        />
        
        <div className="control-bar" style={{justifyContent:'flex-end', padding:'1rem', background:'#050505'}}>
           <button onClick={handleSubmit} disabled={submitting} className="submit-voice-btn" style={{width:'auto', padding:'0 2rem'}}>
             {submitting ? "Analyzing..." : <> <Play size={16}/> Submit Solution </>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default CodingArena;