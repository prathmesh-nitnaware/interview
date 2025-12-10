import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, User } from 'lucide-react';
import '../../styles/layout.css'; 

const Header = () => {
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  return (
    <header className="prep-header">
      <div className="header-inner">
        
        {/* LEFT: Logo */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="logo-name">Prep AI</span>
        </Link>

        {/* CENTER: Nav */}
        <nav className="header-nav">
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
          <Link to="/interview/setup" className={`nav-item ${isActive('/interview/setup') ? 'active' : ''}`}>Interview</Link>
          <Link to="/coding/setup" className={`nav-item ${isActive('/coding/setup') ? 'active' : ''}`}>Coding</Link>
        </nav>

        {/* RIGHT: Avatar */}
        <div className="header-right">
          <Link to="/profile" className="avatar-btn">
             <div className="avatar-circle">
               <User size={20} />
             </div>
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Header;