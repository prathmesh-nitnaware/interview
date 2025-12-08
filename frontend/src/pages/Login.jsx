import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: integrate backend login
    console.log("Login", form);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="hero-shape shape-1" />
      <div className="hero-shape shape-3" />

      <div className="login-card fade-in-up delay-2">
        <div className="auth-header">
          <div className="logo-circle small">AI</div>
          <h2>Welcome Back</h2>
          <p className="auth-sub">
            Continue improving your interview readiness with AI.
          </p>
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
            Login
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/signup">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
