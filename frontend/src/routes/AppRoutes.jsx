import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Guard
import ProtectedRoute from '../components/ProtectedRoute';

// Public Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';

// Protected Application Pages
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';

// Resume Section
import ResumeUpload from '../pages/ResumeUpload';
import ResumeResult from '../pages/ResumeResult';

// Interview Flow
import InterviewSetup from '../pages/InterviewSetup'; // Step 1: Config
import InterviewSession from '../pages/InterviewSession'; // Step 2: Green Room
import InterviewLive from '../pages/InterviewLive'; // Step 3: AI Interview
import InterviewReport from '../pages/InterviewReport'; // Step 4: Results

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌍 PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 🔒 PROTECTED ROUTES (Require Login) */}
      <Route element={<ProtectedRoute />}>
        
        {/* Core */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Resume Module */}
        <Route path="/resume/upload" element={<ResumeUpload />} />
        <Route path="/resume/result" element={<ResumeResult />} />

        {/* Interview Module - Sequential Flow */}
        <Route path="/interview/setup" element={<InterviewSetup />} />
        <Route path="/interview/session" element={<InterviewSession />} />
        <Route path="/interview/live" element={<InterviewLive />} />
        <Route path="/interview/report" element={<InterviewReport />} />

      </Route>

      {/* 404 Catch-All -> Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;