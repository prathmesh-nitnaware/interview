import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Mail, Award, Briefcase, Edit2, Save, X, Camera } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../App.css';
import './Profile.css'; // Created in step 2

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ interviews: 0, avgScore: 0 });
  
  // Local form state
  const [formData, setFormData] = useState({
    name: user?.name || 'Candidate',
    email: user?.email || 'user@example.com',
    role: user?.role || 'Software Engineer',
    bio: 'Passionate developer preparing for big tech interviews.'
  });

  // Fetch performance stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Reuse dashboard endpoint to get stats
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
      // In a real app, update AuthContext here
    }, 1000);
  };

  return (
    <div className="page-container profile-container animate-fade-in">
      
      {/* HEADER CARD */}
      <Card className="profile-header-card">
        <div className="profile-header-content">
          <div className="avatar-wrapper">
            <div className="avatar-placeholder">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            <button className="edit-avatar-btn">
              <Camera size={16} />
            </button>
          </div>
          
          <div className="profile-info-text">
            <h1 className="profile-name text-gradient">{formData.name}</h1>
            <p className="profile-role">{formData.role}</p>
            <div className="profile-badges">
              <span className="badge badge-purple">Pro Member</span>
              <span className="badge badge-blue">Level 5</span>
            </div>
          </div>

          <div className="header-actions">
            {!isEditing ? (
              <Button variant="secondary" onClick={() => setIsEditing(true)} icon={<Edit2 size={16}/>}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsEditing(false)} icon={<X size={16}/>}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} isLoading={loading} icon={<Save size={16}/>}>
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="profile-grid">
        {/* STATS COLUMN */}
        <div className="profile-col-left">
          <Card title="Performance Stats">
            <div className="stat-row">
              <div className="stat-icon-wrapper purple">
                <Briefcase size={20} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.interviews}</span>
                <span className="stat-label">Interviews Completed</span>
              </div>
            </div>
            
            <div className="stat-divider"></div>

            <div className="stat-row">
              <div className="stat-icon-wrapper blue">
                <Award size={20} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.avgScore}%</span>
                <span className="stat-label">Average Score</span>
              </div>
            </div>
          </Card>
        </div>

        {/* DETAILS FORM COLUMN */}
        <div className="profile-col-right">
          <Card title="Personal Information">
            <form className="profile-form">
              <div className="form-grid-2">
                <InputField 
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  icon={<User size={18} />}
                  disabled={!isEditing}
                />
                <InputField 
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  icon={<Mail size={18} />}
                  disabled={!isEditing} // Usually email is locked
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Target Role</label>
                <div className="input-container">
                  <span className="input-icon"><Briefcase size={18}/></span>
                  <input 
                    className="neon-input"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Bio</label>
                <textarea 
                  className="neon-input textarea-input"
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
      </div>
    </div>
  );
};

export default Profile;