import React from 'react';

const InputField = ({ label, type = 'text', ...rest }) => {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} {...rest} />
    </div>
  );
};

export default InputField;
