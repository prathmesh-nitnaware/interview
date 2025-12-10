import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Mail, Briefcase, Edit2, Save, X, Camera, Award } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../styles/theme.css';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ interviews: 0, avgScore: 0 });
  
  const [formData, setFormData] = useState({
    name: user?.name || 'Candidate Name',
    email: user?.email || 'user@example.com',
    role: user?.role || 'Software Engineer',
    bio: 'Passionate developer preparing for big tech interviews.'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboard(user?.id || 'user_123');
        if (data) {
          const totalInterviews = data.interview_scores ? data.interview_scores.length : 0;
          const avg = data.interview_scores?.length 
            ? Math.round(data.interview_scores.reduce((a, b) => a + b, 0) / totalInterviews) 
            : 0;
          
          setStats({ interviews: totalInterviews, avgScore: avg });
        }
      } catch (err) {
        console.error("Error loading stats", err);
      }
    };
    fetchStats();
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
    }, 1000);
  };

  return (
    <div className="profile-root page-container">
      
      {/* Header Section */}
      <div className="profile-header-grid">
        <div className="profile-avatar-section">
          <div className="avatar-large">
            {formData.name.charAt(0).toUpperCase()}
            <button className="edit-avatar-trigger">
              <Camera size={14} />
            </button>
          </div>
        </div>
        
        <div className="profile-info-section">
          <div className="info-header">
            <h1 className="profile-name">{formData.name}</h1>
            <span className="profile-role-tag">{formData.role}</span>
          </div>
          
          <div className="profile-stats-row">
            <div className="stat-item">
              <span className="stat-value">{stats.interviews}</span>
              <span className="stat-label">SESSIONS</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.avgScore}</span>
              <span className="stat-label">AVG SCORE</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">PRO</span>
              <span className="stat-label">PLAN</span>
            </div>
          </div>
        </div>

        <div className="profile-actions-section">
          {!isEditing ? (
            <Button variant="secondary" onClick={() => setIsEditing(true)} className="btn-editorial">
              EDIT PROFILE
            </Button>
          ) : (
            <div className="flex gap-2">
              <button className="btn-text-cancel" onClick={() => setIsEditing(false)}>CANCEL</button>
              <Button variant="primary" onClick={handleSave} isLoading={loading} className="btn-editorial primary">
                SAVE CHANGES
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="profile-content-grid">
        
        {/* Left: Bio & Details */}
        <div className="profile-details-col">
          <Card className="profile-card-editorial">
            <div className="card-header-minimal">
              <h3>PERSONAL DETAILS</h3>
            </div>
            
            <form className="details-form">
              <div className="form-group-editorial">
                <label>FULL NAME</label>
                <input 
                  className={`input-editorial ${isEditing ? '' : 'readonly'}`}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group-editorial">
                <label>EMAIL</label>
                <input 
                  className="input-editorial readonly" 
                  value={formData.email} 
                  disabled 
                />
              </div>

              <div className="form-group-editorial">
                <label>TARGET ROLE</label>
                <input 
                  className={`input-editorial ${isEditing ? '' : 'readonly'}`}
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group-editorial">
                <label>BIO</label>
                <textarea 
                  className={`input-editorial textarea ${isEditing ? '' : 'readonly'}`}
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </form>
          </Card>
        </div>

        {/* Right: Achievements / Badges */}
        <div className="profile-badges-col">
          <Card className="profile-card-editorial">
            <div className="card-header-minimal">
              <h3>ACHIEVEMENTS</h3>
            </div>
            <div className="badges-list">
              <div className="badge-item">
                <Award size={20} />
                <div>
                  <h4>EARLY ADOPTER</h4>
                  <p>Joined Prep AI Alpha</p>
                </div>
              </div>
              <div className="badge-item inactive">
                <Award size={20} />
                <div>
                  <h4>INTERVIEW MASTER</h4>
                  <p>Score 90+ in 5 sessions</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Profile;