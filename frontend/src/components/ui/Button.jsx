import React from 'react';
import '../components.css'; // Shared component styles

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', // Options: 'primary', 'secondary', 'danger', 'ghost'
  disabled = false, 
  isLoading = false,
  className = '',
  icon = null
}) => {
  
  // Combine base class with variant and any custom classes
  const buttonClass = `btn btn-${variant} ${isLoading ? 'btn-loading' : ''} ${className}`;

  return (
    <button 
      type={type} 
      className={buttonClass} 
      onClick={onClick} 
      disabled={disabled || isLoading}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <span className="spinner">
          <svg className="animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}

      {/* Button Content */}
      <span className="btn-content" style={{ opacity: isLoading ? 0 : 1 }}>
        {icon && <span className="btn-icon">{icon}</span>}
        {children}
      </span>
      
      {/* Glow Effect for Primary Buttons */}
      {variant === 'primary' && !disabled && <div className="btn-glow" />}
    </button>
  );
};

export default Button;