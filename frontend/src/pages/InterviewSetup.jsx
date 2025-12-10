import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { Briefcase, FileText, Check, AlertCircle, Sliders } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import FileUpload from '../components/FileUpload';
import '../App.css';
import './InterviewSetup.css';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Load existing resume text if available
  const [resumeText, setResumeText] = useState(
    location.state?.raw_text || localStorage.getItem('last_resume_text') || ""
  );
  
  const [loading, setLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(!resumeText); 

  const [formData, setFormData] = useState({
    role: '',
    experience: '0-2 years',
    type: 'Technical',
    questionCount: 5
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOptionSelect = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    try {
      const data = await api.uploadResume(file);
      setResumeText(data.raw_text);
      localStorage.setItem('last_resume_text', data.raw_text);
      setShowUploader(false);
    } catch (err) {
      alert("Failed to read file. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) return alert("Please specify a Target Job Role.");

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
      console.error(error);
      alert("Error creating session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container setup-wrapper">
      
      {/* 1. LEFT SIDE: Info (35% width) */}
      <div className="setup-info">
        <h1 className="setup-title">
          Configure <br />
          <span className="text-highlight">Session</span>
        </h1>
        <p className="setup-desc">
          Customize your AI interviewer. Upload your resume for personalized questions, or start fresh with a specific job role.
        </p>

        {/* Resume Context Card */}
        <div className={`context-card ${resumeText ? 'loaded' : 'empty'}`}>
          <div className="context-header">
            {resumeText ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{resumeText ? "Resume Context Active" : "No Resume Context"}</span>
          </div>
          <p className="context-detail">
            {resumeText 
              ? "The AI will ask questions based on your specific projects and skills." 
              : "The AI will ask general questions based on the job role provided."}
          </p>
          {resumeText && (
            <button className="link-btn" onClick={() => setShowUploader(true)}>
              Replace Resume
            </button>
          )}
        </div>
      </div>

      {/* 2. RIGHT SIDE: The Form (65% width) */}
      <Card className="setup-form-card">
        <form onSubmit={handleSubmit}>
          
          {/* File Uploader (Conditional) */}
          {showUploader && (
            <div className="form-section fade-in">
              <div className="label-row">
                <FileText size={16} /> <label>Upload Resume (Optional)</label>
              </div>
              <div className="minimal-upload">
                <FileUpload onFileSelect={handleResumeUpload} label="Drop PDF here" />
              </div>
            </div>
          )}

          {/* Role Input */}
          <div className="form-section">
            <div className="label-row">
              <Briefcase size={16} /> <label>Target Role</label>
            </div>
            <InputField
              name="role"
              placeholder="e.g. Senior Product Designer"
              value={formData.role}
              onChange={handleChange}
              required
            />
          </div>

          {/* Grid for Selects */}
          <div className="form-grid">
            <div className="form-section">
              <label className="simple-label">Experience</label>
              <div className="select-group">
                {['0-2 years', '3-5 years', '5+ years'].map(exp => (
                  <button
                    key={exp}
                    type="button"
                    className={`select-btn ${formData.experience === exp ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('experience', exp)}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="simple-label">Type</label>
              <div className="select-group">
                {['Technical', 'Behavioral', 'Mixed'].map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`select-btn ${formData.type === type ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('type', type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="form-section">
             <div className="label-row space-between">
                <div className="flex gap-2 items-center">
                  <Sliders size={16}/> <label>Questions</label>
                </div>
                <span className="slider-value">{formData.questionCount}</span>
             </div>
             <input 
               type="range" 
               name="questionCount" 
               min="3" max="10" step="1"
               value={formData.questionCount}
               onChange={handleChange}
               className="minimal-slider"
             />
          </div>

          <div className="form-footer">
            <Button type="submit" variant="primary" isLoading={loading} className="w-full btn-xl">
              Initialize Session
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
};

export default InterviewSetup;