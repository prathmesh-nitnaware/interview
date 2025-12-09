import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/layout.css'; // Uses shared layout styles

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle-btn glass-card"
      aria-label="Toggle Dark Mode"
      title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className={`icon-container ${theme === 'dark' ? 'mode-dark' : 'mode-light'}`}>
        {theme === 'dark' ? (
          <Moon size={20} className="icon-moon" />
        ) : (
          <Sun size={20} className="icon-sun" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;