import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
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
import CodingSetup from '../pages/CodingSetup';
import CodingArena from '../pages/CodingArena';           
import CodingReport from '../pages/CodingReport';         

const AppRoutes = () => {
  return (
    <Routes>
      {/* Wrap EVERYTHING in Layout */}
      <Route element={<Layout />}>
        
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          
          {/* Main Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* 1. Resume Flow */}
          <Route path="/resume/upload" element={<ResumeUpload />} />
          <Route path="/resume/result" element={<ResumeResult />} />

          {/* 2. Voice Interview Flow */}
          <Route path="/interview/setup" element={<InterviewSetup />} />
          <Route path="/interview/room" element={<InterviewSession />} />
          <Route path="/interview/live" element={<InterviewLive />} />
          <Route path="/interview/report" element={<InterviewReport />} />
          
          {/* 3. Coding Round Flow */}
          <Route path="/coding/setup" element={<CodingSetup />} />
          <Route path="/coding/arena" element={<CodingArena />} />
          <Route path="/coding/report" element={<CodingReport />} />
          
        </Route>

      </Route>

      {/* Fallback - Redirects to Home if route doesn't exist */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;