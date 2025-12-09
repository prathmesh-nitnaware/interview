import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mic, Video, VideoOff, Volume2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import '../App.css';
import './InterviewSession.css'; // We will create this next

const InterviewSession = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();

  const [hasPermissions, setHasPermissions] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // 1. Initialize Media (Mic & Cam)
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        streamRef.current = stream;
        setHasPermissions(true);

        // Attach video stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup Audio Context for Volume Meter
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        javascriptNode.onaudioprocess = () => {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          let values = 0;
          const length = array.length;
          for (let i = 0; i < length; i++) {
            values += array[i];
          }
          const average = values / length;
          setAudioLevel(average);
        };

      } catch (err) {
        console.error("Media Error:", err);
        setError("Please allow camera and microphone access to proceed.");
      }
    };

    initMedia();

    return () => {
      // Cleanup tracks on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStart = () => {
    if (hasPermissions && sessionId) {
      // Navigate to the actual live WebSocket page
      navigate(`/interview/live?session_id=${sessionId}`);
    }
  };

  return (
    <div className="page-container session-lobby-container">
      <div className="lobby-content animate-fade-in-up">
        
        {/* Header */}
        <div className="lobby-header">
          <h1 className="text-gradient">System Check</h1>
          <p className="text-muted">Ensure your environment is ready for the AI.</p>
        </div>

        {/* Main Check Area */}
        <div className="check-grid">
          
          {/* Camera Preview */}
          <div className="video-preview-wrapper glass-card">
            {error ? (
              <div className="permission-error">
                <AlertCircle size={48} color="#ff4757" />
                <p>{error}</p>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="mirror-video"
              />
            )}
            
            {/* Overlay Status */}
            <div className="status-badge">
              {hasPermissions ? (
                <span className="success"><CheckCircle size={14}/> Camera Active</span>
              ) : (
                <span className="pending">Checking...</span>
              )}
            </div>
          </div>

          {/* Audio Meter & Instructions */}
          <Card className="audio-check-card">
            <div className="instruction-step">
              <div className="step-icon"><Mic size={20} /></div>
              <div className="step-content">
                <h3>Test Microphone</h3>
                <p>Speak to test input levels.</p>
                
                {/* Audio Visualizer Bar */}
                <div className="audio-meter-container">
                  <div 
                    className="audio-level-fill" 
                    style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-icon"><Volume2 size={20} /></div>
              <div className="step-content">
                <h3>Quiet Environment</h3>
                <p>Find a quiet place for best AI accuracy.</p>
              </div>
            </div>

            <div className="action-footer">
              <Button 
                onClick={handleStart} 
                disabled={!hasPermissions} 
                className="w-full"
                icon={<ArrowRight size={20} />}
              >
                Join Interview Room
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default InterviewSession;