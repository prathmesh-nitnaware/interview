import React, { useState } from 'react';
import { uploadResumeForInterview } from '../../services/api';

const ModeSelection = ({ onQuestionLoaded }) => {
  const [loading, setLoading] = useState(false);

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // Reuse the parser logic via API
      const questionData = await uploadResumeForInterview(file);
      onQuestionLoaded(questionData); // Callback to switch to Editor view
    } catch (error) {
      console.error("Failed to generate question", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Start Interview</h2>
      <button>General DSA (Easy/Med/Hard)</button>
      
      <div className="upload-section">
        <p>OR Based on Resume</p>
        <input type="file" onChange={handleResumeUpload} accept=".pdf" />
        {loading && <p>Analyzing Resume & Generating Question...</p>}
      </div>
    </div>
  );
};

export default ModeSelection;