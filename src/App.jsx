import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';
import UploadSection from './components/UploadSection.jsx';
import ResultsDashboard from './components/ResultsDashboard.jsx';
import { analyzeResume } from './lib/api.js';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAnalyze = async (file, jobDescription) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeResume(file, jobDescription);
      setResults(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    navigate('/');
  };

  return (
    <div className="App">
      <header className="container" style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '2rem 1rem', marginBottom: '1rem'
      }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} onClick={handleReset}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'var(--primary)', padding: '0.5rem', borderRadius: '12px',
              boxShadow: '0 0 20px hsla(var(--primary-hue), 80%, 50%, 0.4)'
            }}>
              <Shield size={24} color="white" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
              ATS<span className="text-gradient">Guard</span>
            </h2>
          </div>
        </Link>
      </header>

      <main className="container" style={{ minHeight: '70vh', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={
            !results ? (
              <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem', background: 'var(--accent-glow)',
                    borderRadius: '2rem', marginBottom: '1.5rem',
                    color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600
                  }}>
                    <Sparkles size={16} />
                    AI-Powered Resume Optimization
                  </div>
                  <h1 style={{ marginBottom: '1rem' }}>
                    Master the <span className="text-gradient">Algorithms</span>
                  </h1>
                  <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Scan your resume for ATS compatibility and get real-time AI suggestions to land more interviews.
                  </p>
                </div>

                {error && (
                  <div className="glass-card" style={{
                    borderColor: '#ef4444', color: '#ef4444',
                    marginBottom: '2rem', maxWidth: '800px', width: '100%'
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                <UploadSection onAnalyze={handleAnalyze} isLoading={loading} />
              </div>
            ) : (
              <ResultsDashboard results={results} onReset={handleReset} />
            )
          } />
        </Routes>
      </main>

      <footer className="container" style={{
        marginTop: '4rem', padding: '2rem 1rem',
        borderTop: '1px solid var(--card-border)',
        textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem'
      }}>
        <p>© 2026 ATSGuard AI — Powered by Google Gemini. Secure. Private. Intelligent.</p>
      </footer>
    </div>
  );
}

export default App;
