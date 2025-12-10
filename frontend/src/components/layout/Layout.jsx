import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  
  // Logic: Hide Header ONLY on the Landing Page ('/')
  // If you also want to hide it on Login/Signup, add those paths to this check.
  const showHeader = location.pathname !== '/';

  return (
    <div className="app-layout">
      {showHeader && <Header />}
      
      {/* Add top padding ONLY if header is visible. 
        This fixes the "content hidden under header" issue globally.
      */}
      <main style={{ paddingTop: showHeader ? '100px' : '0', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;