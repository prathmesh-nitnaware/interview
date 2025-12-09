import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";

// Import Global Styles
import "./styles/global.css";
import "./styles/theme.css";
import "./styles/layout.css";
import "./components/components.css";
import "./App.css"; // App-specific overrides if any

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          {/* The ThemeProvider applies the 'dark-mode' class to the body.
            The AppRoutes component handles the switching of pages.
          */}
          <div className="app-root">
            <AppRoutes />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
