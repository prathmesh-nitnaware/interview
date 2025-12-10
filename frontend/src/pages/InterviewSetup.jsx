import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { Briefcase, FileText, Check, AlertCircle, Sliders, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import FileUpload from '../components/FileUpload';
import '../styles/theme.css';
import './InterviewSetup.css';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [resumeText, setResumeText] = useState(
    location.state?.raw_text || localStorage.getItem('last_resume_text') || ""
  );
  const [showUploader, setShowUploader] = useState(!resumeText); 
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    role: '',
    experience: '0-2 years',
    type: 'Technical',
    questionCount: 5
  });

  // Handlers
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
      alert("Failed to parse file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) return alert("Target Role is required.");

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
      alert("Session initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-root page-container">
      
      {/* LEFT COLUMN: Narrative & Context */}
      <div className="setup-visual">
        <div className="visual-header">
          <span className="text-mono">01 // CONFIGURATION</span>
          <h1 className="visual-title">DESIGN YOUR <br/> SESSION</h1>
        </div>

        <div className={`context-widget ${resumeText ? 'active' : ''}`}>
          <div className="widget-icon">
            {resumeText ? <Check size={20} /> : <AlertCircle size={20} />}
          </div>
          <div className="widget-content">
            <h3 className="widget-title">{resumeText ? "CONTEXT ACTIVE" : "NO CONTEXT"}</h3>
            <p className="widget-desc">
              {resumeText 
                ? "AI has analyzed your resume. Questions will be tailored to your specific project history." 
                : "Standard mode. AI will ask general competency questions based on the role."}
            </p>
            {resumeText && (
              <button className="widget-action" onClick={() => setShowUploader(true)}>
                REPLACE RESUME
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Form */}
      <div className="setup-form-wrapper">
        <Card className="setup-card-editorial">
          <form onSubmit={handleSubmit}>
            
            {/* Resume Upload Toggle */}
            {showUploader && (
              <div className="form-group fade-in">
                <div className="label-editorial">
                  <FileText size={14} /> RESUME SOURCE
                </div>
                <div className="upload-minimal">
                  <FileUpload onFileSelect={handleResumeUpload} label="UPLOAD PDF" />
                </div>
              </div>
            )}

            {/* Target Role */}
            <div className="form-group">
              <div className="label-editorial">
                <Briefcase size={14} /> TARGET ROLE
              </div>
              <InputField
                name="role"
                placeholder="E.G. SENIOR PRODUCT MANAGER"
                value={formData.role}
                onChange={handleChange}
                required
              />
            </div>

            {/* Settings Grid */}
            <div className="settings-grid">
              
              {/* Experience */}
              <div className="form-group">
                <label className="label-editorial">EXPERIENCE</label>
                <div className="radio-group">
                  {['0-2 YEARS', '3-5 YEARS', '5+ YEARS'].map(exp => (
                    <button
                      key={exp}
                      type="button"
                      className={`radio-btn ${formData.experience === exp.toLowerCase() ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('experience', exp.toLowerCase())}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div className="form-group">
                <label className="label-editorial">FOCUS</label>
                <div className="radio-group">
                  {['TECHNICAL', 'BEHAVIORAL', 'MIXED'].map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`radio-btn ${formData.type === type ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('type', type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Intensity Slider */}
            <div className="form-group mt-4">
               <div className="slider-header">
                  <div className="label-editorial"><Sliders size={14}/> INTENSITY</div>
                  <span className="slider-val">{formData.questionCount} QUESTIONS</span>
               </div>
               <input 
                 type="range" 
                 name="questionCount" 
                 min="3" max="10" step="1"
                 value={formData.questionCount}
                 onChange={handleChange}
                 className="slider-editorial"
               />
            </div>

            <Button type="submit" variant="primary" isLoading={loading} className="w-full btn-editorial primary mt-8">
              INITIATE SESSION <ArrowRight size={16} />
            </Button>

          </form>
        </Card>
      </div>
    </div>
  );
};

export default InterviewSetup;