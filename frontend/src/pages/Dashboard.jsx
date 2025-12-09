import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Play, UploadCloud, Terminal, TrendingUp, Award, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboard('user_123'); 
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="page-container flex-center">Loading...</div>;
  }

  return (
    <div className="page-container dashboard-container">
      
      {/* Header */}
      <section className="dashboard-header">
        <div>
          <h1 className="text-gradient">Welcome, {user?.name || 'Candidate'}</h1>
          <p className="text-muted">Track your progress and start a new session.</p>
        </div>
        <div className="current-date-badge">
          <Calendar size={16} /> {new Date().toLocaleDateString()}
        </div>
      </section>

      {/* Action Grid - 3 Options */}
      <section className="actions-grid">
        
        {/* 1. Resume ATS */}
        <Link to="/resume/upload" className="action-link">
          <Card className="action-card neon-hover-purple">
            <div className="icon-wrapper purple"><UploadCloud size={32} /></div>
            <div>
              <h3>Resume Scan</h3>
              <p>Check ATS compatibility</p>
            </div>
          </Card>
        </Link>

        {/* 2. Mock Interview */}
        <Link to="/interview/setup" className="action-link">
          <Card className="action-card neon-hover-blue">
            <div className="icon-wrapper blue"><Play size={32} /></div>
            <div>
              <h3>Mock Interview</h3>
              <p>Voice-based AI Session</p>
            </div>
          </Card>
        </Link>

        {/* 3. Coding Round (New Feature) */}
        <Link to="/coding" className="action-link">
          <Card className="action-card neon-hover-green">
             <div className="icon-wrapper" style={{
               background: 'rgba(46, 213, 115, 0.15)', 
               color: '#2ed573', 
               boxShadow: '0 0 15px rgba(46, 213, 115, 0.3)'
             }}>
               <Terminal size={32} />
             </div>
             <div>
               <h3>Coding Round</h3>
               <p>DSA & System Design</p>
             </div>
          </Card>
        </Link>
      </section>

      {/* Stats Section */}
      <section className="stats-grid">
        <Card title="Average Score">
          <div className="flex-center flex-col" style={{height: 150}}>
             <span className="text-gradient" style={{fontSize: '3rem', fontWeight:800}}>
               {stats?.interview_scores?.[0] || 0}%
             </span>
             <span className="text-muted">Interview Proficiency</span>
          </div>
        </Card>
        
        <Card title="Recent Activity">
           <div className="activity-list">
             {stats?.recent_activities?.map((act, i) => (
               <div key={i} className="activity-item">
                  {act.type === 'resume' ? <UploadCloud size={16}/> : <Play size={16}/>}
                  <span>{act.date} - Score: {act.score}</span>
               </div>
             )) || <p className="text-muted">No recent activity</p>}
           </div>
        </Card>
      </section>

    </div>
  );
};

export default Dashboard;