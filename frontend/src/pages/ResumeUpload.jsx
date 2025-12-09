import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FileText, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FileUpload from '../components/FileUpload';
import '../App.css';
import './ResumeUpload.css'; // Created in step 2

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
      setError("Please select a resume file first.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload File to Backend
      const data = await api.uploadResume(file);
      
      // 2. Redirect to Result Page with the returned Resume ID
      // Passing state via router avoids putting ID in URL immediately
      navigate('/resume/result', { 
        state: { 
          resume_id: data.resume_id,
          raw_text: data.raw_text 
        } 
      });

    } catch (err) {
      console.error("Upload Error:", err);
      setError("Failed to process resume. Please try a different file.");
      setLoading(false);
    }
  };

  return (
    <div className="page-container resume-upload-container">
      
      {/* Hero Section */}
      <div className="upload-hero animate-fade-in">
        <div className="icon-badge">
          <Cpu size={20} /> AI-Powered ATS
        </div>
        <h1 className="text-gradient">Optimize Your Resume</h1>
        <p className="text-muted">
          Upload your CV to see how it scores against industry standards. 
          Our AI checks for keywords, formatting, and impact metrics.
        </p>
      </div>

      {/* Main Upload Card */}
      <Card className="upload-main-card animate-fade-in-up">
        {loading ? (
          <div className="scanning-ui">
            <div className="scanner-line"></div>
            <div className="doc-icon-large">
              <FileText size={64} />
            </div>
            <h3 className="mt-6 text-white">Analyzing Document...</h3>
            <p className="text-muted">Extracting skills, experience, and education.</p>
          </div>
        ) : (
          <>
            <FileUpload 
              onFileSelect={handleFileSelect} 
              label="Drop your resume here"
              accept=".pdf,.docx,.txt"
            />
            
            {error && <p className="error-text">{error}</p>}

            <div className="upload-actions">
              <Button 
                onClick={handleUpload} 
                disabled={!file} 
                variant="primary" 
                className="w-full btn-lg"
                icon={<ArrowRight size={20} />}
              >
                Scan Resume
              </Button>
            </div>

            <div className="privacy-note">
              <ShieldCheck size={14} />
              <span>Your data is processed securely and not shared with third parties.</span>
            </div>
          </>
        )}
      </Card>
      
      {/* Info Steps */}
      <div className="steps-grid">
        <div className="step-item">
          <span className="step-number">01</span>
          <h4>Upload</h4>
          <p>Support for PDF & DOCX formats.</p>
        </div>
        <div className="step-item">
          <span className="step-number">02</span>
          <h4>Analyze</h4>
          <p>AI extracts key metrics & skills.</p>
        </div>
        <div className="step-item">
          <span className="step-number">03</span>
          <h4>Improve</h4>
          <p>Get actionable feedback instantly.</p>
        </div>
      </div>

    </div>
  );
};

export default ResumeUpload;