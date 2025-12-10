import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Play, UploadCloud, Terminal, ArrowUpRight } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
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
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  if (loading) return <div className="page-container" style={{paddingTop:'150px'}}>Loading...</div>;

  return (
    <div className="page-container dashboard-page">
      <div className="dashboard-content">
        
        {/* HEADER */}
        <section className="profile-header-section">
            <div className="profile-text">
                <div className="profile-badges">
                    <span className="p-badge">{userProfile?.current_job}</span>
                    <span className="p-badge">// AGE {userProfile?.age}</span>
                </div>
                <h1 className="welcome-title">HELLO, {userProfile?.name.split(' ')[0]}</h1>
            </div>
            <div className="stats-mini-grid">
                <div className="mini-stat">
                    <span className="ms-val">{dashboardData?.stats?.total_interviews}</span>
                    <span className="ms-label">SESSIONS</span>
                </div>
                <div className="mini-stat">
                    <span className="ms-val">{dashboardData?.stats?.average_score}</span>
                    <span className="ms-label">AVG SCORE</span>
                </div>
            </div>
        </section>

        {/* ACTIONS */}
        <section className="main-actions-grid">
            <Link to="/interview/setup" className="action-link-card">
                <div className="icon-box"><Play size={32} strokeWidth={1} /></div>
                <h3>Start Interview</h3>
                <p>Voice-based Simulation</p>
            </Link>

            <Link to="/resume/upload" className="action-link-card">
                <div className="icon-box"><UploadCloud size={32} strokeWidth={1} /></div>
                <h3>Resume Scan</h3>
                <p>ATS Optimization</p>
            </Link>

            <Link to="/coding/setup" className="action-link-card">
                <div className="icon-box"><Terminal size={32} strokeWidth={1} /></div>
                <h3>Coding Round</h3>
                <p>Algorithm Practice</p>
            </Link>
        </section>

        {/* RECENT LIST */}
        <section className="recent-section">
            <h3 className="section-head">RECENT ACTIVITY</h3>
            <div className="activity-list-container">
                {dashboardData?.recent_activity?.map((item, i) => (
                    <div key={i} className="activity-row">
                        <div className="act-info">
                            <strong>{item.role}</strong>
                            <span className="act-date">{item.date}</span>
                        </div>
                        <div className="act-action">
                           <ArrowUpRight size={20} color="#666" />
                        </div>
                        <div className="act-score">{item.score}</div>
                    </div>
                ))}
            </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;