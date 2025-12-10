import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mic, Video, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import '../styles/theme.css';
import './InterviewSession.css';

const InterviewSession = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();

  const [hasPermissions, setHasPermissions] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setHasPermissions(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error(err));
  }, []);

  const handleStart = () => {
    if (hasPermissions) navigate(`/interview/live?session_id=${sessionId}`);
  };

  return (
    <div className="session-root page-container">
      <div className="session-header">
        <span className="text-mono">02 // PRE-FLIGHT CHECK</span>
        <h1>SYSTEM CHECK</h1>
      </div>

      <div className="session-grid">
        {/* Video Feed */}
        <div className="video-frame">
          <video ref={videoRef} autoPlay muted playsInline className="mirror-feed" />
          <div className="video-overlay">
            <div className={`status-indicator ${hasPermissions ? 'ready' : 'error'}`}>
              {hasPermissions ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
              <span>{hasPermissions ? "CAMERA ACTIVE" : "NO SIGNAL"}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="session-controls">
          <Card className="card-editorial">
            <h3 className="section-title">ENVIRONMENT GUIDELINES</h3>
            <ul className="check-list">
              <li>ENSURE CLEAR LIGHTING</li>
              <li>USE HEADPHONES FOR BEST AUDIO</li>
              <li>MINIMIZE BACKGROUND NOISE</li>
            </ul>
            <div className="audio-meter-bar">
              {/* Fake visualizer line */}
              <div className="meter-fill"></div>
            </div>
            <Button 
              onClick={handleStart} 
              disabled={!hasPermissions} 
              className="btn-editorial primary w-full"
            >
              ENTER STUDIO <ArrowRight size={16} />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;