import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: integrate backend signup
    console.log("Signup", form);
    navigate("/dashboard");
  };

  return (
    <div className="signup-page">
      <div className="hero-shape shape-1" />
      <div className="hero-shape shape-2" />

      <div className="signup-inner container">
        {/* LEFT */}
        <div className="signup-left fade-in-up delay-1">
          <div className="tag-pill">Step into AI-powered interviews</div>
          <h1>Start Your AI Interview Journey</h1>
          <p className="signup-lead">
            Get ATS resume checks, realistic interviews with AI, and analytics
            that show exactly where you need to improve.
          </p>

          <div className="signup-steps">
            <div className="step-card">
              <div className="step-pill">1</div>
              <div>
                <h4>Upload &amp; Analyze</h4>
                <p>Score your resume for ATS and role-fit in seconds.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-pill">2</div>
              <div>
                <h4>Practice Interviews</h4>
                <p>Answer role-based questions with live AI feedback.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-pill">3</div>
              <div>
                <h4>Track Progress</h4>
                <p>See your strengths, gaps, and improvement trends.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="signup-right fade-in-up delay-2">
          <div className="signup-card">
            <div className="signup-card-header">
              <div className="logo-circle small">AI</div>
              <div>
                <h3>Create Account</h3>
                <span>Start your AI-powered interview prep</span>
              </div>
            </div>

            <button className="oauth-btn">
              <span>G</span> Continue with Google
            </button>
            <button className="oauth-btn">
              <span>🐙</span> Continue with GitHub
            </button>

            <div className="divider">or continue with email</div>

            <form onSubmit={handleSubmit}>
              <input
                className="glass-input"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                className="glass-input"
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                className="glass-input"
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <button type="submit" className="btn-primary full glow">
                Create Account
              </button>

              <p className="auth-footer">
                Already have an account? <Link to="/login">Sign In</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
