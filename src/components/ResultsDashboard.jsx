import React, { useState } from 'react';
import {
  ArrowLeft, Check, X, Zap, Fingerprint, Sparkles, Wand2,
  Loader2, Info, AlertCircle, Search
} from 'lucide-react';
import { fetchSuggestions, humanifyText } from '../lib/api.js';

const SkillBadge = ({ text, type = 'matched' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 500,
    background: type === 'matched' ? 'var(--accent-glow)' : 'rgba(239,68,68,0.1)',
    border: `1px solid ${type === 'matched' ? 'var(--accent)' : '#ef4444'}`,
    color: type === 'matched' ? 'var(--accent)' : '#ef4444',
    margin: '0.25rem'
  }}>
    {type === 'matched' ? <Check size={12} /> : <X size={12} />}
    {text}
  </span>
);

const ResultsDashboard = ({ results, onReset }) => {
  const {
    ats_score, breakdown, keyword_analysis, skills,
    sections_found, word_count, resume_text, job_description,
    scannability_audit, ai_detection
  } = results;

  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState(null);
  const [humanifyingId, setHumanifyingId] = useState(null);

  const handleFetchSuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestionError(null);
    try {
      const data = await fetchSuggestions(
        resume_text,
        job_description,
        keyword_analysis.missing.slice(0, 10)
      );
      setSuggestions(data);
    } catch (err) {
      setSuggestionError(err.message);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleHumanify = async (idx, text) => {
    setHumanifyingId(idx);
    try {
      const data = await humanifyText(text);
      const updated = [...suggestions];
      updated[idx] = { ...updated[idx], optimized: data.humanified };
      setSuggestions(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setHumanifyingId(null);
    }
  };

  const scoreColor = ats_score >= 70 ? 'var(--accent)' : ats_score >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="animate-fade-in container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>

      {/* Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onReset} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '0.9rem'
        }}>
          <ArrowLeft size={18} /> Back to analysis
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {word_count} words analyzed
        </span>
      </div>

      {/* Top Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

        {/* ATS Score Gauge */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '1.5rem' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="90" cy="90" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
              <circle
                cx="90" cy="90" r="80"
                stroke={scoreColor}
                strokeWidth="10" fill="transparent"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - ats_score / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2.5rem', margin: 0, color: scoreColor }}>{Math.round(ats_score)}%</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ATS Match</p>
            </div>
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Overall ATS Score</h3>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Semantic: <strong style={{ color: 'var(--text-main)' }}>{Math.round(breakdown.semantic_score)}%</strong></span>
            <span>Keywords: <strong style={{ color: 'var(--text-main)' }}>{Math.round(breakdown.keyword_score)}%</strong></span>
            <span>Skills: <strong style={{ color: 'var(--text-main)' }}>{Math.round(breakdown.skill_score)}%</strong></span>
          </div>
        </div>

        {/* 7-Second Scan Audit */}
        <div className="glass-card" style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Zap size={20} color="#10b981" /> 7-Second Scan Audit
            </h3>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {Math.round(scannability_audit.scannability_score)}%
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(scannability_audit.checks).map(([key, passed]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                {passed ? <Check size={16} color="#10b981" /> : <AlertCircle size={16} color="#f59e0b" />}
                <span style={{ color: passed ? 'var(--text-main)' : 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {key.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              <strong>Tip:</strong> {scannability_audit.tips?.[0]}
            </p>
          </div>
        </div>

        {/* AI Authenticity Meter */}
        <div className="glass-card" style={{ background: 'rgba(236,72,153,0.03)', border: '1px solid rgba(236,72,153,0.1)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Fingerprint size={20} color="#ec4899" /> AI Authenticity Check
          </h3>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Detection Result</p>
            <div style={{
              fontSize: '1.75rem', fontWeight: 800,
              color: ai_detection.ai_probability > 60 ? '#ef4444' : '#10b981'
            }}>
              {ai_detection.ai_probability > 50 ? '🤖 Likely AI-Written' : '✅ Appears Human'}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              ({ai_detection.ai_probability}% AI probability)
            </p>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            <strong>Analysis:</strong> {ai_detection.analysis}
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <section className="glass-card" style={{ border: '1px solid var(--accent-glow)', background: 'rgba(139,92,246,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={24} color="var(--accent)" /> AI Resume Optimization
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Personalized improvements powered by Google Gemini.
            </p>
          </div>
          {!suggestions ? (
            <button className="btn-primary" onClick={handleFetchSuggestions} disabled={loadingSuggestions}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loadingSuggestions ? <><Loader2 className="animate-spin" size={18} /> Generating...</> : <><Wand2 size={18} /> Generate Suggestions</>}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>
              <Check size={16} /> Suggestions Ready
            </div>
          )}
        </div>

        {suggestionError && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ {suggestionError}</div>}

        {suggestions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
            {suggestions.map((item, idx) => (
              <div key={idx} className="glass-card" style={{ background: 'rgba(255,255,255,0.01)', padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '1.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{item.original}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Optimized</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5 }}>{item.optimized}</p>
                    <button
                      onClick={() => handleHumanify(idx, item.optimized)}
                      disabled={humanifyingId === idx}
                      style={{
                        marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)',
                        background: 'rgba(79,70,229,0.1)', border: '1px solid var(--primary)',
                        padding: '0.4rem 0.8rem', borderRadius: '1.5rem', cursor: 'pointer'
                      }}
                    >
                      {humanifyingId === idx ? <><Loader2 className="animate-spin" size={14} /> Humanizing...</> : <><Wand2 size={14} /> Humanify Tone</>}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <Info size={14} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    <strong>Strategy:</strong> {item.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Keyword Match */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={20} color="var(--primary)" /> Keyword Analysis
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {keyword_analysis.matched.slice(0, 20).map(kw => <SkillBadge key={kw} text={kw} type="matched" />)}
          {keyword_analysis.missing.slice(0, 20).map(kw => <SkillBadge key={kw} text={kw} type="missing" />)}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ✅ {keyword_analysis.matched.length} matched · ❌ {keyword_analysis.missing.length} missing · {Math.round(keyword_analysis.match_percentage)}% keyword coverage
        </p>
      </div>
    </div>
  );
};

export default ResultsDashboard;
