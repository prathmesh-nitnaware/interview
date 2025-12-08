import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  /* ---------------- TYPEWRITER EFFECT ---------------- */
  const fullText = "AI-Powered Interview Tools";
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyped(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-hero">

      {/* ---------------- PARTICLE FIELD ---------------- */}
      <div className="particle-field">
        {Array.from({ length: 45 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* ---------------- FLOATING SHAPES ---------------- */}
      <div className="hero-shape shape-1"></div>
      <div className="hero-shape shape-2"></div>
      <div className="hero-shape shape-3"></div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <section className="landing-content container fade-in-up delay-1">

        {/* LEFT CONTENT */}
        <div className="landing-left">
          <div className="tag-pill fade-in-up delay-1">
            Powered by Advanced AI Technology
          </div>

          <h1 className="landing-title fade-in-up delay-2">
            Transform Your Learning with{" "}
            <span className="gradient-text">
              {typed}
              <span className="type-cursor">|</span>
            </span>
          </h1>

          <p className="landing-desc fade-in-up delay-3">
            Practice mock interviews, analyze your confidence, understand your
            communication clarity, and track your growth with detailed AI
            feedback tailored to real interview scenarios.
          </p>

          <div className="landing-actions fade-in-up delay-4">
            <button
              className="btn-primary btn-large glow"
              onClick={() => navigate("/signup")}
            >
              Start Learning Free →
            </button>

            <button
              className="btn-ghost"
              onClick={() => navigate("/login")}
            >
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="landing-meta fade-in-up delay-5">
            <div>
              <h4>4,890+</h4>
              <span>Interview questions practiced</span>
            </div>
            <div>
              <h4>92%</h4>
              <span>Users feel more confident</span>
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="landing-right fade-in-up delay-4">
          <div className="hero-orbit">

            {/* Outer Orbit */}
            <div className="orbit-ring orbit-1"></div>

            {/* Inner Orbit */}
            <div className="orbit-ring orbit-2"></div>

            {/* Center AI Core */}
            <div className="orbit-core">
              <span style={{ fontWeight: "600" }}>Live</span>
              <small>AI Feedback</small>
            </div>

            {/* Badges */}
            <div className="orbit-badge orbit-badge-1">🎤 Voice & Tone</div>
            <div className="orbit-badge orbit-badge-2">👀 Delivery Skills</div>
            <div className="orbit-badge orbit-badge-3">💡 Smart Insights</div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
