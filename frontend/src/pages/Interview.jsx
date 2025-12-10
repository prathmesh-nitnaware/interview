import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Sliders, Briefcase, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../styles/theme.css';
import './Interview.css';

const Interview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    experience: '0-2 years',
    type: 'Technical',
    questionCount: 5
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelect = (key, val) => {
    setFormData({ ...formData, [key]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) return;
    setLoading(true);
    try {
      const data = await api.startInterview(
        formData.role, formData.experience, formData.type, formData.questionCount, null
      );
      if (data?.session_id) navigate(`/interview/session?session_id=${data.session_id}`);
    } catch { alert("Error"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="interview-root page-container">
      <div className="interview-split">
        <div className="interview-meta">
          <h1 className="meta-title">SESSION <br/> CONFIG</h1>
          <p className="meta-desc">Define the parameters for your AI simulation. Choose specificity and intensity.</p>
        </div>

        <div className="interview-form-wrapper">
          <Card className="card-editorial">
            <form onSubmit={handleSubmit}>
              <div className="group-editorial">
                <InputField 
                  label="TARGET ROLE"
                  name="role"
                  placeholder="E.G. SYSTEM ARCHITECT"
                  value={formData.role}
                  onChange={handleChange}
                />
              </div>

              <div className="group-editorial">
                <label className="label-editorial">EXPERIENCE LEVEL</label>
                <div className="chips-row">
                  {['0-2 YEARS', '3-5 YEARS', '5+ YEARS'].map(exp => (
                    <button
                      key={exp} type="button"
                      className={`chip-btn ${formData.experience === exp.toLowerCase() ? 'active' : ''}`}
                      onClick={() => handleSelect('experience', exp.toLowerCase())}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="group-editorial">
                <label className="label-editorial">SESSION TYPE</label>
                <div className="chips-row">
                  {['TECHNICAL', 'BEHAVIORAL', 'SYSTEM DESIGN'].map(type => (
                    <button
                      key={type} type="button"
                      className={`chip-btn ${formData.type === type ? 'active' : ''}`}
                      onClick={() => handleSelect('type', type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="group-editorial">
                <div className="flex-between">
                  <label className="label-editorial">INTENSITY</label>
                  <span className="text-mono">{formData.questionCount} QUESTIONS</span>
                </div>
                <input 
                  type="range" min="3" max="10" 
                  value={formData.questionCount}
                  onChange={(e) => handleSelect('questionCount', e.target.value)}
                  className="slider-editorial"
                />
              </div>

              <Button type="submit" variant="primary" isLoading={loading} className="btn-editorial primary w-full mt-6">
                INITIALIZE <ChevronRight size={16} />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Interview;