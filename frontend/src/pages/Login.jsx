import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../App.css';
import './Login.css'; // We will create this next

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to where they came from, or dashboard by default
  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || "Invalid email or password");
    }
  };

  return (
    <div className="page-container login-container">
      {/* Show Public Navbar on Login Page */}
      <Navbar /> 

      <div className="login-content animate-fade-in-up">
        <Card className="login-card">
          <div className="login-header">
            <div className="icon-glow-wrapper">
              <LogIn size={32} className="text-primary" />
            </div>
            <h2 className="text-gradient">Welcome Back</h2>
            <p className="text-muted">Access your personal AI career coach.</p>
          </div>

          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={18} />}
              required
            />
            
            <InputField
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock size={18} />}
              required
            />

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" /> 
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" class="link-sm">Forgot Password?</Link>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full mt-4" 
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup" className="text-gradient link-bold">Sign Up</Link></p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;