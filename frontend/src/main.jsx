import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// NOTE: Global styles are imported inside App.jsx to ensure 
// they apply to all child components within the Context Providers.

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);