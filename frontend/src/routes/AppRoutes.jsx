import React from "react";
import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ResumeUpload from "../pages/ResumeUpload";
import ResumeResult from "../pages/ResumeResult";
import InterviewSetup from "../pages/InterviewSetup";
import InterviewLive from "../pages/InterviewLive";
import InterviewReport from "../pages/InterviewReport";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/resume" element={<ResumeUpload />} />
      <Route path="/resume/result" element={<ResumeResult />} />

      <Route path="/interview/setup" element={<InterviewSetup />} />
      <Route path="/interview/live" element={<InterviewLive />} />
      <Route path="/interview/report" element={<InterviewReport />} />
    </Routes>
  );
};

export default AppRoutes;
