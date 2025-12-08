import React from "react";
import Header from "./components/layout/Header";
import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "./theme/ThemeContext";
import "./components/components.css";

function App() {
  return (
    <ThemeProvider>
      <Header />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
