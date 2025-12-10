import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Wrapper
import Layout from '../components/layout/Layout';

// Auth Guard
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import ResumeUpload from '../pages/ResumeUpload';
import ResumeResult from '../pages/ResumeResult';
import InterviewSetup from '../pages/InterviewSetup';
import InterviewSession from '../pages/InterviewSession';
import InterviewLive from '../pages/InterviewLive';
import InterviewReport from '../pages/InterviewReport';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Wrap EVERYTHING in Layout. Layout handles showing/hiding Header. */}
      <Route element={<Layout />}>
        
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Resume Flow */}
          <Route path="/resume/upload" element={<ResumeUpload />} />
          <Route path="/resume/result" element={<ResumeResult />} />

          {/* Interview Flow */}
          <Route path="/interview/setup" element={<InterviewSetup />} />
          <Route path="/interview/session" element={<InterviewSession />} />
          <Route path="/interview/live" element={<InterviewLive />} />
          <Route path="/interview/report" element={<InterviewReport />} />
          
          {/* Coding Flow (Placeholder) */}
          <Route path="/coding/setup" element={<Dashboard />} /> 
        </Route>

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;