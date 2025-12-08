import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">AI</div>
        <span className="sidebar__title">Mock Interview</span>
      </div>

      <nav className="sidebar__nav">
        <NavLink to="/dashboard" className="sidebar__link">
          <span>📊</span> <span>Analytics</span>
        </NavLink>
        <NavLink to="/interview" className="sidebar__link">
          <span>🎤</span> <span>Interview</span>
        </NavLink>
        <NavLink to="/resume" className="sidebar__link">
          <span>📄</span> <span>My Resume</span>
        </NavLink>
        <NavLink to="/profile" className="sidebar__link">
          <span>👤</span> <span>Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        <button className="btn btn-outline" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
