import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Mic, 
  LogOut, 
  Menu, 
  X, 
  Cpu 
} from 'lucide-react';
import '../../styles/layout.css'; // We will add the specific styles below

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Mock Logout - replace with actual AuthContext logic later
  const handleLogout = () => {
    // auth.logout(); 
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Resume ATS', path: '/resume/upload', icon: <FileText size={18} /> },
    { name: 'Mock Interview', path: '/interview/setup', icon: <Mic size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="neon-header glass-card">
      <div className="header-container">
        {/* Logo Section */}
        <Link to="/dashboard" className="logo-area">
          <div className="logo-icon-wrapper animate-pulse">
            <Cpu size={24} color="#fff" />
          </div>
          <span className="logo-text text-gradient">AI.Mock</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
              {isActive(link.path) && <div className="nav-glow" />}
            </Link>
          ))}
          
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X color="white" /> : <Menu color="white" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="mobile-nav glass-card">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className="mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          <button onClick={handleLogout} className="mobile-link logout">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;