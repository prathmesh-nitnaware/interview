import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Mic, FileText } from 'lucide-react';
import Navbar from '../components/Navbar'; 
import '../styles/theme.css'; // Keep global theme vars
import './Landing.css';       // Import the dedicated CSS

const Landing = () => {
  const [text, setText] = useState('');
  const fullText = "MASTER YOUR CAREER with Prep. AI"; // The text to type out
  
  // Minimalist Typewriter Logic
  useEffect(() => {
    let index = 0;
    const speed = 100; // Typing speed in ms

    const typeWriter = () => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index));
        index++;
        setTimeout(typeWriter, speed);
      }
    };

    typeWriter();
  }, []);

  return (
    <div className="landing-root">
      
      {/* Navbar */}
      <nav className="landing-nav">
        <span className="nav-brand">PREP AI.</span>
        <div className="nav-links">
          <Link to="/login" className="nav-link-login">LOG IN</Link>
          <Link to="/signup" className="nav-link-signup">GET STARTED</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="page-container hero-section">
        <div className="fade-in-up">
          <span className="text-editorial-sub">The Future of Interview Prep</span>
          
          {/* TYPEWRITER EFFECT HEADLINE */}
          <h1 className="text-editorial-h1 hero-title">
            <span className="typing-text">{text}</span>
          </h1>
          
          <p className="text-muted hero-desc fade-in-up delay-200">
            Real-time voice analysis, ATS resume scoring, and algorithmic challenges. 
            Designed for professionals who demand perfection.
          </p>
          
          <div className="hero-actions fade-in-up delay-300">
            <Link to="/signup" className="btn-editorial primary">
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-editorial">
              Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="page-container features-section">
        <div className="features-header fade-in-up delay-500">
          <h2 className="features-title">CORE MODULES</h2>
          <span className="text-editorial-sub">V 2.0</span>
        </div>

        <div className="features-grid">
          
          {/* Feature 01 */}
          <div className="card-editorial fade-in-up delay-200">
            <div className="feature-card-header">
              <Mic size={32} color="white" strokeWidth={1.5} />
              <span className="text-mono">01</span>
            </div>
            <h3 className="feature-heading">Voice Analysis</h3>
            <p className="text-muted feature-desc">
              AI-driven feedback on your tone, pacing, and confidence levels during mock sessions.
            </p>
          </div>

          {/* Feature 02 */}
          <div className="card-editorial fade-in-up delay-300">
            <div className="feature-card-header">
              <FileText size={32} color="white" strokeWidth={1.5} />
              <span className="text-mono">02</span>
            </div>
            <h3 className="feature-heading">ATS Scorer</h3>
            <p className="text-muted feature-desc">
              Upload your PDF/DOCX. Get an instant score based on industry-standard parsing algorithms.
            </p>
          </div>

          {/* Feature 03 */}
          <div className="card-editorial fade-in-up delay-500">
            <div className="feature-card-header">
              <Terminal size={32} color="white" strokeWidth={1.5} />
              <span className="text-mono">03</span>
            </div>
            <h3 className="feature-heading">Coding Dojo</h3>
            <p className="text-muted feature-desc">
              Practice DSA and System Design problems in a distraction-free, integrated environment.
            </p>
          </div>

        </div>
      </section>

      {/* Footer / Trust Section */}
      <section className="trust-section">
        <p className="text-editorial-sub trust-label">Trusted by candidates from</p>
        <div className="trust-logos">
          <span className="trust-logo-text">GOOGLE</span>
          <span className="trust-logo-text">AMAZON</span>
          <span className="trust-logo-text">META</span>
          <span className="trust-logo-text">NETFLIX</span>
        </div>
      </section>

      {/* Noise Overlay */}
      <div className="noise-bg"></div>
    </div>
  );
};

export default Landing;