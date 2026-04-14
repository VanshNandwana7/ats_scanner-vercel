import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, FileText, Loader2 } from 'lucide-react';

const UploadSection = ({ onAnalyze, isLoading }) => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !jobDescription.trim()) return;
    onAnalyze(file, jobDescription);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h2 style={{ textAlign: 'center' }}>
          Analyze Your <span className="text-gradient">Resume</span>
        </h2>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--card-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragging ? 'rgba(139,92,246,0.1)' : 'rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx"
            style={{ display: 'none' }}
            id="resume-upload"
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {!file ? (
              <>
                <div style={{ padding: '1rem', background: 'var(--card-bg)', borderRadius: '50%' }}>
                  <Upload size={32} color={isDragging ? 'var(--primary)' : 'var(--text-muted)'} />
                </div>
                <p style={{ fontWeight: 600 }}>Click or drag &amp; drop your resume</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PDF, DOCX — Max 10MB</p>
              </>
            ) : (
              <>
                <div style={{ padding: '1rem', background: 'var(--accent-glow)', borderRadius: '50%' }}>
                  <CheckCircle size={32} color="var(--accent)" />
                </div>
                <p style={{ fontWeight: 600 }}>{file.name}</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Remove file
                </button>
              </>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label htmlFor="job-desc" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <FileText size={18} color="var(--primary)" />
            Job Description
          </label>
          <textarea
            id="job-desc"
            className="input-field"
            placeholder="Paste the target job description here..."
            style={{ minHeight: '150px', resize: 'vertical' }}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={!file || !jobDescription.trim() || isLoading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Analyzing with Gemini AI...
            </>
          ) : (
            '🚀 Scan My Resume'
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadSection;
