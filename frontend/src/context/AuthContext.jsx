import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Check for existing session on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. Mock Login Function
  const login = async (email, password) => {
    setLoading(true);
    
    // Simulate API Network Delay (1.5s) to show the Neon Spinner
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple validation (In real app, call api.login here)
    if (email && password) {
      const mockUser = { 
        id: "usr_001", 
        name: email.split('@')[0], // Use part of email as name
        email: email, 
        role: "candidate" 
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setLoading(false);
      navigate('/dashboard');
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, message: "Invalid credentials" };
    }
  };

  // 3. Mock Signup Function
  const signup = async (name, email, password) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser = { id: "usr_002", name, email, role: "candidate" };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    setLoading(false);
    navigate('/dashboard');
    return { success: true };
  };

  // 4. Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
      
      {/* This ensures the loading screen persists until we are sure of auth state.
        However, ProtectedRoute also handles loading, so we can just render children 
        or a specific loading state here.
      */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--bg-dark)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          {/* Simple loading text for context initialization */}
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Custom Hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;