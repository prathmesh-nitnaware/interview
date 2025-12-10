import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../styles/theme.css'; // Global Theme
import './Signup.css'; // Specific Styles

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
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const result = await signup(formData.name, formData.email, formData.password);
    if (!result.success) {
      setError(result.message || "Failed to create account.");
    }
  };

  return (
    <div className="signup-root">
      <div className="signup-split">
        
        {/* Left Side: Visual/Brand */}
        <div className="signup-visual">
          <div className="visual-content">
            <span className="brand-tag">PREP AI.</span>
            <h1 className="visual-heading">Join the <br/> Elite.</h1>
            <p className="visual-text">
              Master your interview skills with AI-driven analysis. 
              Join thousands of professionals securing top-tier roles.
            </p>
          </div>
          <div className="visual-footer">
            <span>V 2.0</span>
            <span>© 2025</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="signup-form-container">
          <Card className="signup-card-editorial">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Start your journey today.</p>
            </div>

            {error && (
              <div className="error-banner">
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <InputField
                label="FULL NAME"
                name="name"
                placeholder="JOHN DOE"
                value={formData.name}
                onChange={handleChange}
                icon={<User size={16} />}
                required
              />

              <InputField
                type="email"
                label="EMAIL ADDRESS"
                name="email"
                placeholder="YOU@EXAMPLE.COM"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail size={16} />}
                required
              />

              <div className="password-grid">
                <InputField
                  type="password"
                  label="PASSWORD"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<Lock size={16} />}
                  required
                />
                <InputField
                  type="password"
                  label="CONFIRM"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={<Lock size={16} />}
                  required
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full btn-editorial primary mt-6" 
                isLoading={loading}
              >
                Sign Up <ArrowRight size={16} />
              </Button>
            </form>

            <div className="form-footer">
              <p>Already a member? <Link to="/login" className="link-highlight">Log In</Link></p>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Signup;