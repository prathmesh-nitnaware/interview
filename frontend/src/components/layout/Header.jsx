import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const onLanding = location.pathname === "/";

  return (
    <header className="global-header">
      <div className="container header-inner">
        {/* Logo + Name (always visible, clickable) */}
        <div
          className="header-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="logo-circle">AI</div>
          <span className="logo-text">Interview Coach</span>
        </div>

        <div className="header-actions">
          <ThemeToggle />

          {/* Right actions - show on all pages */}
          <button className="nav-link-btn" onClick={() => navigate("/login")}>
            Sign In
          </button>
          <button
            className="btn-primary nav-get-started"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
