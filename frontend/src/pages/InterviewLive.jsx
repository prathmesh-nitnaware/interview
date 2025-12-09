import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, Activity, Clock, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';
import '../App.css';
import './InterviewLive.css';

const InterviewLive = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();

  const [question, setQuestion] = useState("Connecting to server...");
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("connecting");
  const [analysis, setAnalysis] = useState({ clarity: 0, confidence: 0 });
  const [elapsedTime, setElapsedTime] = useState(0);

  const ws = useRef(null);
  const mediaRecorder = useRef(null);
  const mediaStream = useRef(null); // Ref to hold stream for cleanup
  const timerRef = useRef(null);

  // --- TTS Helper ---
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      // Optional: pick a specific voice if available
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Lifecycle & WS ---
  useEffect(() => {
    if (!sessionId) {
      navigate('/dashboard');
      return;
    }

    ws.current = new WebSocket(`ws://localhost:8000/api/interview/live/${sessionId}`);

    ws.current.onopen = () => {
      console.log("✅ WS Connected");
      setStatus("active");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'question':
          setQuestion(data.content);
          setStatus("active");
          speak(data.content); // 🗣️ Trigger AI Voice
          break;
        
        case 'analysis':
          setAnalysis({
            clarity: data.clarity || 0,
            confidence: data.confidence || 0
          });
          break;
          
        case 'status':
          setQuestion(data.content);
          setStatus("processing");
          break;

        case 'end':
          setStatus("end");
          navigate(`/interview/report?session_id=${sessionId}`);
          break;

        default:
          break;
      }
    };

    // --- CLEANUP (Crucial for Privacy) ---
    return () => {
      if (ws.current) ws.current.close();
      if (timerRef.current) clearInterval(timerRef.current);
      window.speechSynthesis.cancel(); // Stop voice

      // Stop Camera & Mic
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
        console.log("🛑 Media tracks stopped");
      }
    };
  }, [sessionId, navigate]);

  // --- Recording Logic ---
  const startRecording = async () => {
    try {
      // Get stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream; // Save ref
      mediaRecorder.current = new MediaRecorder(stream);
      
      // Handle data
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.current.readyState === WebSocket.OPEN) {
          const reader = new FileReader();
          reader.readAsDataURL(event.data);
          reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            ws.current.send(JSON.stringify({ type: "audio_chunk", data: base64data }));
          };
        }
      };

      mediaRecorder.current.start(1000); 
      setIsRecording(true);
      startTimer();
      
    } catch (err) {
      alert("Microphone access is required.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      stopTimer();
      // Signal finished
      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ 
            type: "user_answer_finished", 
            content: "Simulated text answer from user audio" // Mock STT
        }));
      }
    }
  };

  const startTimer = () => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
  };

  const stopTimer = () => clearInterval(timerRef.current);
  const formatTime = (s) => `${Math.floor(s/60)}:${s%60 < 10 ? '0'+(s%60) : s%60}`;

  return (
    <div className="page-container live-container">
      <div className="status-pill active">
        <div className={`status-dot ${status === 'active' ? 'active' : 'processing'}`}></div>
        <span>{status === 'active' ? "Live Session" : "AI Thinking..."}</span>
      </div>

      <div className="live-grid">
        <Card className="ai-card">
          <div className={`ai-avatar ${status === 'processing' ? 'thinking' : ''}`}>
             <div className="ai-core"></div>
             <div className="ai-ring ring-1"></div>
             <div className="ai-ring ring-2"></div>
          </div>
          <div className="question-box">
             <h2 className="text-gradient">AI Interviewer</h2>
             <p className="current-question">"{question}"</p>
          </div>
        </Card>

        <div className="user-section">
          <div className="metrics-row">
             <Card className="metric-card">
               <Activity size={20} className="text-primary"/>
               <h3>Clarity</h3>
               <div className="metric-value">{analysis.clarity}%</div>
             </Card>
             <Card className="metric-card">
               <AlertTriangle size={20} className="text-secondary"/>
               <h3>Confidence</h3>
               <div className="metric-value">{analysis.confidence}%</div>
             </Card>
          </div>

          <div className="controls-area text-center">
            <div className="timer-display mb-4">
              <Clock size={16} style={{display:'inline', marginRight:5}} />
              {formatTime(elapsedTime)}
            </div>
            
            {!isRecording ? (
              <button 
                 onClick={startRecording} 
                 className="btn btn-primary"
                 disabled={status !== 'active'}
              >
                 <Mic size={20} style={{marginRight:8}}/> Start Answering
              </button>
            ) : (
              <button onClick={stopRecording} className="btn btn-danger">
                 <MicOff size={20} style={{marginRight:8}}/> Stop & Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewLive;