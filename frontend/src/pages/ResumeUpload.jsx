import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FileText, ArrowRight, Shield, UploadCloud } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FileUpload from '../components/FileUpload';
import '../styles/theme.css';
import './ResumeUpload.css';

const ResumeUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.uploadResume(file);
      // Redirect to Result Page
      navigate('/resume/result', { 
        state: { 
          resume_id: data.resume_id,
          raw_text: data.raw_text 
        } 
      });
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try another file.");
      setLoading(false);
    }
  };

  return (
    <div className="resume-root page-container">
      
      {/* Header Area */}
      <div className="resume-header">
        <h1 className="resume-title">ATS OPTIMIZER</h1>
        <p className="resume-subtitle">
          Upload your CV to unlock AI-driven insights. Our engine parses formatting, keywords, and impact metrics.
        </p>
      </div>

      {/* Main Upload Area */}
      <div className="resume-content">
        <Card className="upload-card-editorial">
          {loading ? (
            <div className="scanning-state">
              <div className="scan-line"></div>
              <FileText size={48} className="scan-icon" />
              <h3>ANALYZING STRUCTURE...</h3>
              <p>Extracting key competencies</p>
            </div>
          ) : (
            <>
              <div className="upload-section">
                <FileUpload 
                  onFileSelect={handleFileSelect} 
                  label="DRAG PDF HERE"
                  accept=".pdf,.docx,.txt"
                />
              </div>
              
              {error && <p className="error-text-editorial">{error}</p>}

              <div className="upload-actions">
                <Button 
                  onClick={handleUpload} 
                  disabled={!file} 
                  className="btn-editorial primary w-full"
                >
                  START ANALYSIS <ArrowRight size={16} />
                </Button>
              </div>

              <div className="privacy-badge">
                <Shield size={12} />
                <span>SECURE PARSING PROTOCOL ACTIVE</span>
              </div>
            </>
          )}
        </Card>

        {/* Steps / Info */}
        <div className="steps-row">
          <div className="step-col">
            <span className="step-num">01</span>
            <h4>UPLOAD</h4>
            <p>PDF or DOCX format supported.</p>
          </div>
          <div className="step-col">
            <span className="step-num">02</span>
            <h4>PARSE</h4>
            <p>AI extracts skills & history.</p>
          </div>
          <div className="step-col">
            <span className="step-num">03</span>
            <h4>SCORE</h4>
            <p>Get actionable feedback.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResumeUpload;