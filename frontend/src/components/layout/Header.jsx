import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User } from "lucide-react";

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "90px",
        zIndex: 1000,
        background: "rgba(10, 10, 10, 0.7)", // Dark semi-transparent
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          padding: "0 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* LOGO */}
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: "900",
              color: "white",
              letterSpacing: "2px",
              fontFamily: "inherit",
            }}
          >
            PREP.AI
          </span>
        </Link>

        {/* NAV */}
        <nav className="desktop-nav" style={{ display: "flex", gap: "3rem" }}>
          {["Dashboard", "Interview", "Coding"].map((item) => {
            const path = `/${item
              .toLowerCase()
              .replace(" ", "/")}/setup`.replace(
              "/dashboard/setup",
              "/dashboard"
            );
            const active = isActive(path);
            return (
              <Link
                key={item}
                to={path}
                style={{
                  color: active ? "white" : "#666",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  fontSize: "0.8rem",
                  letterSpacing: "1px",
                  fontWeight: active ? "700" : "500",
                  transition: "color 0.3s",
                }}
              >
                {item}
              </Link>
            );
          })}
        </nav>

        {/* PROFILE */}
        <Link
          to="/profile"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#1a1a1a",
            border: "1px solid #333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            overflow: "hidden",
          }}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="User"
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <User size={18} />
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
