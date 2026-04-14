/**
 * Centralized API module — all backend calls go through here.
 * No hardcoded URLs. Uses relative paths so it works on Vercel and locally.
 */

const BASE = '/api';

export async function analyzeResume(file, jobDescription) {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('job_description', jobDescription);

  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Analysis failed.');
  return data;
}

export async function fetchSuggestions(resumeText, jobDescription, missingKeywords) {
  const res = await fetch(`${BASE}/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resume_text: resumeText,
      job_description: jobDescription,
      missing_keywords: missingKeywords,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load suggestions.');
  return data;
}

export async function humanifyText(text) {
  const res = await fetch(`${BASE}/humanify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Humanify failed.');
  return data;
}
