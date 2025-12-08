import React from "react";
import { useTheme } from "../../theme/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      <span className={`toggle-icon ${isDark ? "active" : ""}`}>🌙</span>
      <span className={`toggle-icon ${!isDark ? "active" : ""}`}>☀️</span>
      <span
        className={`toggle-thumb ${isDark ? "thumb-left" : "thumb-right"}`}
      />
    </button>
  );
};

export default ThemeToggle;
