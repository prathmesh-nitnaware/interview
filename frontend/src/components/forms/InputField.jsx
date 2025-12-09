import React from 'react';
import '../components.css'; // Ensure you have the CSS below saved

const InputField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  icon = null // Optional icon component (e.g. from lucide-react)
}) => {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label" htmlFor={name}>{label}</label>}
      
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        
        <input
          id={name}
          className="neon-input"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );
};

export default InputField;