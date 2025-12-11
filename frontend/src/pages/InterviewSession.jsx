import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './InterviewSession.css';

const InterviewSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Data from Setup
  const questionData = location.state?.question;
  const sessionConfig = location.state?.config;

  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  useEffect(() => {
    // Variable to hold the stream securely for cleanup
    let localStream = null;

    const getPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        localStream = stream; // Store it locally
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermissions(true);
      } catch (err) {
        console.error("Permission Error:", err);
        setPermissionError("Camera/Mic access denied. Please enable permissions.");
      }
    };

    if (!questionData) {
       console.warn("No session data found.");
    }

    getPermissions();

    // --- CLEANUP FUNCTION (Runs when you leave the page) ---
    return () => {
      if (localStream) {
        console.log("Stopping Camera & Mic (Session Page)...");
        localStream.getTracks().forEach(track => {
          track.stop(); // Stops the hardware light
          track.enabled = false;
        });
      }
    };
  }, [navigate, questionData]);

  const startActualInterview = () => {
    navigate('/interview/live', { 
      state: { 
        question: questionData,
        config: sessionConfig 
      } 
    });
  };

  if (permissionError) {
    return (
      <div className="session-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
        <p style={{ color: '#ccc', marginTop: '10px' }}>{permissionError}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px' }}>Retry</button>
      </div>
    );
  }

  return (
    <div className="session-container">
      <div className="preview-card">
        <h1>System Check</h1>
        <p style={{ color: '#888', marginBottom: '20px' }}>Ensure you are in a quiet environment.</p>
        <div className="video-wrapper">
          <video ref={videoRef} autoPlay playsInline muted className="live-video" />
        </div>
        <div className="action-area">
          {hasPermissions ? (
            <button onClick={startActualInterview} className="btn-start-interview">
              JOIN SESSION <ArrowRight size={18} />
            </button>
          ) : (
            <button disabled className="btn-loading">Checking Devices...</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;