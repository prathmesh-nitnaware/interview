import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/layout/Header';
import { Play, UploadCloud, Terminal, Award, Briefcase, User } from 'lucide-react';
import Card from '../components/ui/Card';
import '../App.css'; 
import './Dashboard.css';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock User ID (In real app, get from AuthContext)
  const USER_ID = "user_123"; 

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, dashRes] = await Promise.all([
            api.getUserProfile(USER_ID),
            api.getDashboard(USER_ID)
        ]);
        setUserProfile(userRes);
        setDashboardData(dashRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="page-center">Loading Dashboard...</div>;

  return (
    <div className="page-container dashboard-page">
      <Header />
      
      <div className="dashboard-content">
        
        {/* 1. USER PROFILE SECTION */}
        <section className="profile-header-section">
            <div className="profile-text">
                <h1 className="welcome-title">Hello, {userProfile?.name}</h1>
                <div className="profile-badges">
                    <span className="p-badge"><Briefcase size={14}/> {userProfile?.current_job}</span>
                    <span className="p-badge outline">Age: {userProfile?.age}</span>
                    <span className="p-badge outline">Target: {userProfile?.target_role}</span>
                </div>
            </div>
            <div className="stats-mini-grid">
                <div className="mini-stat">
                    <span className="ms-val">{dashboardData?.stats?.total_interviews}</span>
                    <span className="ms-label">Sessions</span>
                </div>
                <div className="mini-stat">
                    <span className="ms-val text-primary">{dashboardData?.stats?.average_score}%</span>
                    <span className="ms-label">Avg Score</span>
                </div>
            </div>
        </section>

        {/* 2. MAIN ACTION GRID (3 Cards) */}
        <section className="main-actions-grid">
            <Link to="/interview/setup" className="action-link-card">
                <div className="icon-box blue"><Play size={28}/></div>
                <h3>Start Interview</h3>
                <p>Voice-based AI mock session</p>
            </Link>

            <Link to="/resume/upload" className="action-link-card">
                <div className="icon-box purple"><UploadCloud size={28}/></div>
                <h3>Resume Scan</h3>
                <p>ATS score & improvements</p>
            </Link>

            <Link to="/coding/setup" className="action-link-card">
                <div className="icon-box green"><Terminal size={28}/></div>
                <h3>Coding Round</h3>
                <p>DSA & System Design</p>
            </Link>
        </section>

        {/* 3. RECENT ACTIVITY LIST */}
        <section className="recent-section">
            <h3 className="section-head">Recent Activity</h3>
            <div className="activity-list-container">
                {dashboardData?.recent_activity?.length > 0 ? (
                    dashboardData.recent_activity.map((item, i) => (
                        <div key={i} className="activity-row glass-card">
                            <div className="act-icon"><Award size={18}/></div>
                            <div className="act-info">
                                <strong>{item.role}</strong>
                                <span className="act-date">{item.date}</span>
                            </div>
                            <div className="act-score">{item.score}</div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted">No interviews yet. Start one above!</p>
                )}
            </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;