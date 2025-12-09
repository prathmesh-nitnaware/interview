import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. Initialize state from localStorage or default to 'dark'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'dark'; // Default to dark for the Neon look
  });

  // 2. Effect to apply the theme class to the body
  useEffect(() => {
    const body = document.body;
    
    // Remove old class and add new one
    body.classList.remove('light-mode', 'dark-mode');
    body.classList.add(`${theme}-mode`);
    
    // Save to local storage
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // 3. Toggle Function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;