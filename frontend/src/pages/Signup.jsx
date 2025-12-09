import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../App.css';
import './Signup.css'; // We will create this next

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Basic Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }
    
    // 2. Password Match Check
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 3. Password Strength (Optional simple check)
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // 4. Call Auth Context
    const result = await signup(formData.name, formData.email, formData.password);
    
    if (!result.success) {
      setError(result.message || "Failed to create account.");
    }
    // Note: Success redirect is handled inside AuthContext or you can do it here
  };

  return (
    <div className="page-container signup-container">
      <Navbar />

      <div className="signup-content animate-fade-in-up">
        <Card className="signup-card">
          
          <div className="signup-header">
            <div className="icon-glow-wrapper">
              <UserPlus size={32} className="text-secondary" />
            </div>
            <h2 className="text-gradient">Create Account</h2>
            <p className="text-muted">Start your journey to interview mastery.</p>
          </div>

          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              icon={<User size={18} />}
              required
            />

            <InputField
              type="email"
              label="Email Address"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={18} />}
              required
            />

            <InputField
              type="password"
              label="Password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock size={18} />}
              required
            />

            <InputField
              type="password"
              label="Confirm Password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<Lock size={18} />}
              required
            />

            <div className="terms-text">
              By signing up, you agree to our <span className="highlight">Terms</span> & <span className="highlight">Privacy Policy</span>.
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full mt-2" 
              isLoading={loading}
            >
              Create Account
            </Button>
          </form>

          <div className="signup-footer">
            <p>Already have an account? <Link to="/login" className="text-gradient link-bold">Log In</Link></p>
          </div>

        </Card>
      </div>
    </div>
  );
};

export default Signup;