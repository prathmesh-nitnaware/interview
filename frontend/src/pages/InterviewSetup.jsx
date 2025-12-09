import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { Briefcase, FileText, CheckCircle, Sliders } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import FileUpload from '../components/FileUpload';
import '../App.css';
import './InterviewSetup.css';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Resume State
  const [resumeText, setResumeText] = useState(
    location.state?.raw_text || localStorage.getItem('last_resume_text') || ""
  );
  const [showUpload, setShowUpload] = useState(!resumeText);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    role: '',
    experience: '0-2 years',
    type: 'Technical',
    questionCount: 5
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    try {
      const data = await api.uploadResume(file);
      setResumeText(data.raw_text);
      localStorage.setItem('last_resume_text', data.raw_text);
      setShowUpload(false);
    } catch (err) {
      alert("Resume upload failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) return alert("Please enter a Job Role");

    setLoading(true);
    try {
      const data = await api.startInterview(
        formData.role,
        formData.experience,
        formData.type,
        parseInt(formData.questionCount),
        resumeText
      );
      if (data?.session_id) {
        navigate(`/interview/session?session_id=${data.session_id}`);
      }
    } catch (error) {
      alert("Failed to start session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container setup-wrapper">
      <div className="setup-header">
        <h1>New Interview Session</h1>
        <p>Configure your AI interviewer settings below.</p>
      </div>

      <div className="setup-content">
        <Card className="setup-card">
          <form onSubmit={handleSubmit}>
            
            {/* 1. Resume Context Section */}
            <div className="form-section">
              <div className="section-label">
                <FileText size={18} /> Resume Context
              </div>
              
              {showUpload ? (
                <div className="upload-box-minimal">
                  <FileUpload onFileSelect={handleResumeUpload} label="Upload PDF/DOCX" />
                </div>
              ) : (
                <div className="resume-success-banner">
                  <div className="flex-align">
                    <CheckCircle size={18} color="#10b981" />
                    <span>Resume Loaded Successfully</span>
                  </div>
                  <button 
                    type="button" 
                    className="text-link"
                    onClick={() => { setResumeText(""); setShowUpload(true); }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* 2. Role Configuration */}
            <div className="form-section">
              <div className="section-label">
                <Briefcase size={18} /> Role Details
              </div>
              <InputField
                name="role"
                placeholder="Target Role (e.g. Product Manager)"
                value={formData.role}
                onChange={handleChange}
                required
              />
              
              <div className="grid-2">
                <select 
                  name="experience" 
                  value={formData.experience} 
                  onChange={handleChange}
                  className="minimal-select"
                >
                  <option>0-2 years</option>
                  <option>3-5 years</option>
                  <option>5+ years</option>
                </select>

                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                  className="minimal-select"
                >
                  <option>Technical</option>
                  <option>Behavioral</option>
                  <option>Mixed</option>
                </select>
              </div>
            </div>

            {/* 3. Session Settings */}
            <div className="form-section">
              <div className="section-label">
                <Sliders size={18} /> Session Length
              </div>
              <div className="range-wrapper">
                <input 
                  type="range" 
                  name="questionCount" 
                  min="3" 
                  max="10" 
                  value={formData.questionCount} 
                  onChange={handleChange}
                />
                <span className="count-badge">{formData.questionCount} Qs</span>
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={loading} className="w-full btn-large">
              Start Interview
            </Button>

          </form>
        </Card>
      </div>
    </div>
  );
};

export default InterviewSetup;