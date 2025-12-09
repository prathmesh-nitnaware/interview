import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Mic, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import '../../styles/layout.css'; // We will add the specific styles below

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Resume ATS', path: '/resume/upload', icon: <FileText size={20} /> },
    { name: 'Interview', path: '/interview/setup', icon: <Mic size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  const handleLogout = () => {
    // Add auth logout logic here
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`neon-sidebar glass-card ${isCollapsed ? 'collapsed' : ''}`}>
      
      {/* Toggle Button */}
      <button 
        className="sidebar-toggle" 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            title={isCollapsed ? item.name : ''}
          >
            <div className="icon-wrapper">{item.icon}</div>
            <span className="link-text">{item.name}</span>
            {isActive(item.path) && <div className="active-glow" />}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-footer">
        <Link to="/settings" className="sidebar-link">
          <div className="icon-wrapper"><Settings size={20} /></div>
          <span className="link-text">Settings</span>
        </Link>
        <button onClick={handleLogout} className="sidebar-link logout-btn">
          <div className="icon-wrapper"><LogOut size={20} /></div>
          <span className="link-text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;