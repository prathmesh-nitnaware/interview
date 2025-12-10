import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../styles/theme.css';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      setError(result.message || "Invalid credentials");
    }
  };

  return (
    <div className="login-root">
      
      {/* Background Element */}
      <div className="login-bg-text">LOGIN</div>

      <div className="login-container">
        <Card className="login-card-editorial">
          
          <div className="login-header">
            <span className="brand-small">PREP AI.</span>
            <h1>Welcome Back</h1>
            <p>Access your dashboard</p>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={16} /> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField
              type="email"
              label="EMAIL"
              name="email"
              placeholder="YOU@EXAMPLE.COM"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={16} />}
              required
            />
            
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

            <div className="form-options">
              <label className="checkbox-editorial">
                <input type="checkbox" /> 
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" class="link-simple">Forgot Password?</Link>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full btn-editorial primary mt-6" 
              isLoading={loading}
            >
              Sign In <ArrowRight size={16} />
            </Button>
          </form>

          <div className="login-footer">
            <p>New here? <Link to="/signup" className="link-highlight">Create an account</Link></p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;