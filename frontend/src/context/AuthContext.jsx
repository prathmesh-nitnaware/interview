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

  // 2. REAL Login Function (Integrated from Teammate)
  const login = async (email, password) => {
    setLoading(true);

    try {
      // Attempt to contact the backend
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: email,  
          password: password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful - Create user session
        // Note: Ideally, the backend should return the user data. 
        // We are constructing it here based on your teammate's logic.
        const user = { 
          id: "usr_" + Date.now(), 
          name: email.split('@')[0], 
          email: email, 
          role: "candidate" 
        };

        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'authenticated'); // Storing simple auth token

        setLoading(false);
        navigate('/dashboard');
        return { success: true };
      } else {
        // Login failed - Handle specific backend errors
        setLoading(false);
        let userMessage = "Login failed. ";

        if (data.error === "Invalid credentials") {
          userMessage = "❌ Incorrect email or password. Please try again.";
        } else if (data.error === "Username and password required") {
          userMessage = "⚠️ Please enter both email and password.";
        } else if (response.status === 500) {
          userMessage = "🔧 Server error. Please try again in a moment.";
        } else if (data.error) {
          userMessage = `⚠️ ${data.error}`;
        } else {
          userMessage = "Login failed. Please check your details.";
        }

        return { success: false, message: userMessage };
      }
    } catch (error) {
      // Network error (Backend down or CORS issues)
      setLoading(false);
      console.error("Login network error:", error);
      
      let userMessage = "🌐 Connection problem. \n\n";
      userMessage += "Please check:\n";
      userMessage += "1. Is the backend running? (python app.py)\n";
      userMessage += "2. Is port 5000 accessible?";

      return { success: false, message: userMessage };
    }
  };

  // 3. REAL Signup Function (Integrated from Teammate)
  const signup = async (name, email, password) => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: email,  
          password: password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Signup successful
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
        // Signup failed
        setLoading(false);
        let userMessage = "Signup failed. ";

        if (data.error === "User already exists") {
          userMessage = "📧 This email is already registered. Try logging in instead.";
        } else if (data.error === "Username and password required") {
          userMessage = "⚠️ Please fill in all required fields.";
        } else if (response.status === 500) {
          userMessage = "🔧 Server error. Please try again in a moment.";
        } else if (data.error) {
          userMessage = `⚠️ ${data.error}`;
        } else {
          userMessage = "Unable to create account. Please try again.";
        }

        return { success: false, message: userMessage };
      }
    } catch (error) {
      setLoading(false);
      console.error("Signup network error:", error);
      return { 
        success: false, 
        message: "🌐 Cannot connect to server. Check if backend is running." 
      };
    }
  };

  // 4. Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Clean up token as well
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
      
      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--bg-dark)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          {/* You can put your Neon Spinner here if you have one */}
          <div style={{color: 'white'}}>Loading...</div>
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