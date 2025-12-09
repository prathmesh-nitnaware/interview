import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, FileText, BarChart2, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar'; // Use the public navbar we made earlier
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import '../App.css';
import './Landing.css'; // Specific animations for this page

const Landing = () => {
  const [text, setText] = useState('');
  const fullText = "Master Your Next Interview with AI.";
  
  // Typewriter Effect Logic
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        {/* Animated Background Blobs */}
        <div className="blob blob-purple"></div>
        <div className="blob blob-blue"></div>

        <div className="hero-content">
          <div className="badge-pill animate-fade-in">
            <span className="dot"></span> AI-Powered Career Coach
          </div>
          
          <h1 className="hero-title">
            <span className="text-gradient">{text}</span>
            <span className="cursor-blink">|</span>
          </h1>
          
          <p className="hero-subtitle animate-fade-in-up delay-100">
            Real-time voice analysis, posture tracking, and ATS resume scoring. 
            Get hired faster with the world's most advanced mock interview platform.
          </p>

          <div className="hero-actions animate-fade-in-up delay-200">
            <Link to="/signup">
              <Button className="btn-lg glow-button">
                Start Free Trial <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/login">
              <button className="btn-ghost-rounded">Live Demo</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section page-container">
        <h2 className="section-heading text-center">Everything you need to <span className="text-gradient">succeed</span></h2>
        
        <div className="features-grid">
          <Card className="feature-card">
            <div className="feature-icon-wrapper purple">
              <Mic size={32} />
            </div>
            <h3>Voice Analysis</h3>
            <p>Our AI analyzes your tone, pace, and clarity in real-time to ensure you sound confident.</p>
          </Card>

          <Card className="feature-card">
            <div className="feature-icon-wrapper blue">
              <FileText size={32} />
            </div>
            <h3>Resume ATS Scorer</h3>
            <p>Upload your resume and get instant feedback on missing keywords and formatting issues.</p>
          </Card>

          <Card className="feature-card">
            <div className="feature-icon-wrapper pink">
              <BarChart2 size={32} />
            </div>
            <h3>Detailed Reports</h3>
            <p>Get a comprehensive scorecard after every session highlighting your strengths and weaknesses.</p>
          </Card>
        </div>
      </section>

      {/* Trust/Social Proof */}
      <section className="trust-section">
        <p>TRUSTED BY CANDIDATES FROM</p>
        <div className="logos-row opacity-50">
          <span>GOOGLE</span>
          <span>AMAZON</span>
          <span>MICROSOFT</span>
          <span>TESLA</span>
        </div>
      </section>

    </div>
  );
};

export default Landing;