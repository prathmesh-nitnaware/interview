import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import "./components.css"; // Shared styles

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Detect scroll to add solid background/glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className={`public-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="logo-text">AI.Mock</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          <Link to="/" className="nav-link">Features</Link>
          <Link to="/" className="nav-link">Pricing</Link>
          <Link to="/login" className="nav-link">Log In</Link>
          <Link to="/signup">
            <button className="btn btn-primary btn-sm">Get Started</button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" className="mobile-link">Features</Link>
        <Link to="/login" className="mobile-link">Log In</Link>
        <Link to="/signup" className="mobile-link highlight">Get Started</Link>
      </div>
    </nav>
  );
};

export default Navbar;