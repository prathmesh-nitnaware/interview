import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. Hardcode theme to 'dark'
  const theme = 'dark';

  // 2. Enforce the dark-mode class on the body when the app starts
  useEffect(() => {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode'); // Safety cleanup
    
    // Optional: Persist just in case other logic checks localStorage
    localStorage.setItem('app-theme', 'dark'); 
  }, []);

  return (
    // We removed 'toggleTheme' since it is no longer needed.
    <ThemeContext.Provider value={{ theme }}>
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