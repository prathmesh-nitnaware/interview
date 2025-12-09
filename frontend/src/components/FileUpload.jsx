import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import "./components.css"; // Shared styles + specific upload styles below

const FileUpload = ({ onFileSelect, accept = ".pdf,.docx", label = "Upload Resume" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Handle Drag Events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop Event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Manual Click Selection
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Validation & State Update
  const validateAndSetFile = (file) => {
    // Check file type (simple extension check)
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = accept.replace(/\./g, '').split(',');
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Please upload ${accept}`);
      return;
    }

    // Check file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large (Max 5MB)");
      return;
    }

    setError(null);
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  // Remove File
  const clearFile = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="file-upload-wrapper">
      <div 
        className={`upload-dropzone glass-card ${dragActive ? 'drag-active' : ''} ${error ? 'border-error' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="hidden-input" 
          accept={accept} 
          onChange={handleChange}
        />

        {!selectedFile ? (
          <div className="upload-prompt">
            <div className="icon-glow-circle">
              <UploadCloud size={32} />
            </div>
            <h4 className="text-gradient">{label}</h4>
            <p className="upload-subtext">Drag & drop or click to browse</p>
            <span className="file-types">Supports: PDF, DOCX</span>
          </div>
        ) : (
          <div className="file-preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="file-info">
              <div className="file-icon">
                <FileText size={24} />
              </div>
              <div className="file-details">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            <button className="remove-btn" onClick={clearFile}>
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;