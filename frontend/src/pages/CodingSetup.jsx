import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; 
import { Code, FileText, Zap, UploadCloud, Layers } from 'lucide-react';
import './InterviewSetup.css'; 

const CodingSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // State for the new UI Flow
  const [mode, setMode] = useState(null); // 'RESUME' or 'GENERAL'
  const [resumeText, setResumeText] = useState("");
  
  const [config, setConfig] = useState({
    role: "Software Engineer",
    language: "Python",
    difficulty: "Medium"
  });

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await api.scoreResume(file, "General");
      if (data.extracted_text) {
          setResumeText(data.extracted_text);
          alert("Resume Context Loaded!");
      }
    } catch (err) {
      alert("Resume parse failed.");
    }
  };

  const startCoding = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Logic: If General Mode, we send empty resume_context. 
      // The backend will see empty context and just generate a random DSA problem.
      const sessionConfig = {
        role: config.role,
        experience: config.difficulty, // We map difficulty to experience level for the AI
        focus: "Coding", 
        intensity: 1,    
        resume_context: mode === 'RESUME' ? resumeText : "" 
      };

      const data = await api.startInterview(sessionConfig);
      
      if (data) {
        navigate('/coding/arena', { 
            state: { question: data, config: sessionConfig } 
        });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate problem. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-root page-container">
      <div className="setup-visual">
        <h1 className="visual-title">CODING <br/> ARENA</h1>
        <div className={`context-widget ${mode ? 'active' : ''}`}>
           {mode === 'RESUME' ? "MODE: RESUME BASED" : mode === 'GENERAL' ? "MODE: GENERAL DSA" : "SELECT A MODE"}
        </div>
      </div>

      <div className="setup-form-wrapper">
        <div className="setup-card-editorial">
          
          {/* STEP 1: MODE SELECTION */}
          {!mode ? (
            <div className="mode-selection">
                <h2 style={{fontSize:'1.5rem', marginBottom:'2rem'}}>CHOOSE YOUR CHALLENGE</h2>
                
                <button className="mode-btn" onClick={() => setMode('RESUME')}>
                    <FileText size={32} color="#3b82f6"/>
                    <div>
                        <h3>Resume Based</h3>
                        <p>AI generates problems based on your specific tech stack and projects.</p>
                    </div>
                </button>

                <button className="mode-btn" onClick={() => setMode('GENERAL')}>
                    <Layers size={32} color="#22c55e"/>
                    <div>
                        <h3>General DSA</h3>
                        <p>Standard Data Structures & Algorithms practice (Arrays, Trees, DP).</p>
                    </div>
                </button>
            </div>
          ) : (
            /* STEP 2: CONFIGURATION FORM */
            <form onSubmit={startCoding} className="fade-in">
                <button type="button" onClick={() => setMode(null)} className="back-text-btn">← Change Mode</button>
                
                {/* Resume Upload - Only for Resume Mode */}
                {mode === 'RESUME' && (
                  <div className="form-group">
                     <label className="label-editorial">UPLOAD RESUME</label>
                     <div className="upload-minimal">
                        <label className={`cursor-pointer block text-center py-4 border-2 border-dashed rounded ${resumeText ? 'border-green-500 bg-green-900/20' : 'border-gray-600'}`}>
                           {resumeText ? (
                               <span className="text-green-400 flex items-center justify-center gap-2"><FileText size={16}/> Resume Loaded</span>
                           ) : (
                               <>
                                <UploadCloud size={24} className="mx-auto mb-2 text-gray-400"/>
                                <span className="text-gray-300">Click to Upload PDF</span>
                               </>
                           )}
                           <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                        </label>
                     </div>
                  </div>
                )}

                <div className="form-group">
                   <label className="label-editorial">PROGRAMMING LANGUAGE</label>
                   <div className="radio-group">
                      {['Python', 'JavaScript', 'Java', 'C++'].map(lang => (
                        <button type="button" key={lang} 
                          className={`radio-btn ${config.language === lang ? 'selected' : ''}`}
                          onClick={() => setConfig({...config, language: lang})}
                        >{lang}</button>
                      ))}
                   </div>
                </div>

                <div className="form-group">
                   <label className="label-editorial">DIFFICULTY LEVEL</label>
                   <div className="radio-group">
                      {['Easy', 'Medium', 'Hard'].map(diff => (
                        <button type="button" key={diff} 
                          className={`radio-btn ${config.difficulty === diff ? 'selected' : ''}`}
                          onClick={() => setConfig({...config, difficulty: diff})}
                        >{diff}</button>
                      ))}
                   </div>
                </div>

                <button type="submit" disabled={loading || (mode === 'RESUME' && !resumeText)} className="w-full btn-editorial primary mt-8">
                  {loading ? "GENERATING CHALLENGE..." : "ENTER ARENA →"}
                </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingSetup;