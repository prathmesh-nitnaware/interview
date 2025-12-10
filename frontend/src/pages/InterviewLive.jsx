import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mic, MicOff, StopCircle } from 'lucide-react';
import '../styles/theme.css';
import './InterviewLive.css';

const InterviewLive = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [question, setQuestion] = useState("Initializing...");
  
  // (Assuming logic is similar to previous, just re-skinning here)
  
  return (
    <div className="live-root page-container">
      
      {/* Top Bar */}
      <div className="live-header">
        <span className="live-badge">● LIVE RECORDING</span>
        <span className="timer-text">00:45</span>
      </div>

      {/* Main Interface */}
      <div className="teleprompter-view">
        <h2 className="ai-question">"{question}"</h2>
      </div>

      {/* Controls */}
      <div className="live-controls">
        <button 
          className={`record-btn ${isRecording ? 'active' : ''}`}
          onClick={() => setIsRecording(!isRecording)}
        >
          {isRecording ? <div className="stop-square" /> : <div className="mic-icon"><Mic size={24}/></div>}
        </button>
        <p className="status-text">{isRecording ? "LISTENING..." : "TAP TO ANSWER"}</p>
      </div>

    </div>
  );
};

export default InterviewLive;