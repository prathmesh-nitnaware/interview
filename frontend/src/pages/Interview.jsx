import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Briefcase, Clock, Code, Zap } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../App.css'; // Global styles
import './Interview.css'; // Specific styles for this page (see below)

const Interview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    experience: '0-2 years',
    type: 'Technical', // Technical, Behavioral, System Design
    techStack: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOptionSelect = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) return alert("Please enter a Job Role");

    setLoading(true);
    try {
      // 1. Call Backend to initialize session
      const data = await api.startInterview(
        formData.role, 
        formData.experience, 
        formData.type
      );
      
      // 2. Redirect to Live Room with Session ID
      // Expecting response: { session_id: "...", first_question: "..." }
      if (data && data.session_id) {
        navigate(`/interview/session?session_id=${data.session_id}`);
      } else {
        throw new Error("Invalid session data");
      }
    } catch (error) {
      console.error("Setup failed:", error);
      alert("Failed to start interview. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container interview-setup-container">
      
      {/* Left Column: Visual/Info */}
      <div className="setup-info animate-slide-in-left">
        <h1 className="hero-title">
          Design Your <br />
          <span className="text-gradient">Perfect Interview</span>
        </h1>
        <p className="hero-subtitle">
          Configure the AI persona to match your target job description. 
          Our system adapts to your experience level and technical requirements.
        </p>
        
        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-icon"><Zap size={20} /></div>
            <span>Real-time speech analysis</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Code size={20} /></div>
            <span>Technical & Behavioral tracks</span>
          </div>
        </div>
      </div>

      {/* Right Column: Configuration Form */}
      <Card className="setup-card animate-slide-in-right">
        <form onSubmit={handleSubmit}>
          <h2 className="form-title">Session Configuration</h2>

          {/* Job Role Input */}
          <div className="form-group">
            <InputField
              label="Target Job Role"
              name="role"
              placeholder="e.g. Senior React Developer"
              value={formData.role}
              onChange={handleChange}
              icon={<Briefcase size={18} />}
              required
            />
          </div>

          {/* Tech Stack (Optional) */}
          <div className="form-group">
            <InputField
              label="Tech Stack / Keywords"
              name="techStack"
              placeholder="e.g. AWS, Node.js, TypeScript"
              value={formData.techStack}
              onChange={handleChange}
              icon={<Code size={18} />}
            />
          </div>

          {/* Experience Level Selector */}
          <div className="form-group">
            <label className="form-label">Experience Level</label>
            <div className="options-grid">
              {['0-2 years', '3-5 years', '5+ years'].map((exp) => (
                <div 
                  key={exp}
                  className={`option-chip ${formData.experience === exp ? 'active' : ''}`}
                  onClick={() => handleOptionSelect('experience', exp)}
                >
                  {exp}
                </div>
              ))}
            </div>
          </div>

          {/* Interview Type Selector */}
          <div className="form-group">
            <label className="form-label">Interview Focus</label>
            <div className="options-grid">
              {['Technical', 'Behavioral', 'Mixed'].map((type) => (
                <div 
                  key={type}
                  className={`option-chip ${formData.type === type ? 'active' : ''}`}
                  onClick={() => handleOptionSelect('type', type)}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <Button 
              type="submit" 
              variant="primary" 
              isLoading={loading} 
              className="w-full"
            >
              Initialize AI Session 🚀
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Interview;