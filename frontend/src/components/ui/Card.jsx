import React from 'react';
import '../components.css'; // Shared component styles

const Card = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className = '', 
  onClick 
}) => {
  return (
    <div 
      className={`glass-card ${onClick ? 'card-interactive' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Optional Header Section */}
      {(title || actions) && (
        <div className="card-header">
          <div className="card-header-text">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}

      {/* Main Content */}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;