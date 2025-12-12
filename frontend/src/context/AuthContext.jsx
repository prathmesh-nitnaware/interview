import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const API_URL = "http://localhost:5000"; 

  // 1. Check for existing session on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. Login Function
  const login = async (email, password) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: email,  
          password: password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        const user = { 
          id: "usr_" + Date.now(), 
          name: email.split('@')[0], 
          email: email, 
          role: "candidate" 
        };

        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'authenticated');

        setLoading(false);
        navigate('/dashboard');
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: data.error || "Login failed" };
      }
    } catch (error) {
      setLoading(false);
      console.error("Login network error:", error);
      return { 
        success: false, 
        message: "🌐 Server is waking up (Free Tier). Please try again in 30 seconds." 
      };
    }
  };

  // 3. Signup Function
  const signup = async (name, email, password) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: email,  
          password: password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        const user = { 
          id: "usr_" + Date.now(), 
          name: name, 
          email: email, 
          role: "candidate" 
        };

        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'authenticated');

        setLoading(false);
        navigate('/dashboard');
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: data.error || "Signup failed" };
      }
    } catch (error) {
      setLoading(false);
      console.error("Signup network error:", error);
      return { 
        success: false, 
        message: "🌐 Server is waking up (Free Tier). Please try again in 30 seconds." 
      };
    }
  };

  // 4. Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, background: '#0a0a0a', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{color: 'white', fontFamily: 'sans-serif'}}>
             Connecting to Prep AI...
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
