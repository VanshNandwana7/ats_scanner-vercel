"""
Gemini-powered ATS resume analyzer.
Replaces sentence-transformers, spacy, scikit-learn with a single Gemini prompt.
"""
import os
import json
import re
from typing import Any


def _get_model():
    import google.generativeai as genai
    api_key = os.environ.get("GOOGLE_API_KEY", "")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")


def analyze_resume(resume_text: str, job_description: str) -> dict[str, Any]:
    """
    Full ATS analysis using Gemini. Returns same schema as the original analyzer.
    """
    prompt = f"""
You are an expert ATS system and career coach. Analyze the resume against the job description.

RESUME:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

Return a SINGLE valid JSON object with EXACTLY this structure (no markdown, no explanation):
{{
  "ats_score": <number 0-100>,
  "breakdown": {{
    "semantic_score": <number 0-100>,
    "keyword_score": <number 0-100>,
    "skill_score": <number 0-100>
  }},
  "keyword_analysis": {{
    "matched": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"],
    "match_percentage": <number 0-100>,
    "total_jd_keywords": <integer>
  }},
  "skills": {{
    "resume_skills": {{ "technical": ["skill1"], "soft": ["skill2"] }},
    "jd_skills": {{ "technical": ["skill1"], "soft": ["skill2"] }},
    "missing_technical_skills": ["skill3"],
    "missing_soft_skills": ["skill4"]
  }},
  "sections_found": ["experience", "education", "skills"],
  "scannability_audit": {{
    "scannability_score": <number 0-100>,
    "checks": {{
      "action_verb_usage": <true/false>,
      "quantified_impact": <true/false>,
      "formatting_density": <true/false>
    }},
    "tips": ["tip1", "tip2", "tip3"]
  }},
  "ai_detection": {{
    "ai_probability": <number 0-100>,
    "markers": ["word1", "word2"],
    "analysis": "short explanation"
  }},
  "word_count": <integer>
}}
"""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        text = response.text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except json.JSONDecodeError:
        # Extract JSON from response if it has extra text
        match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise
    except Exception as e:
        # Return fallback structure on error
        return _fallback_analysis(resume_text, job_description, str(e))


def _fallback_analysis(resume_text: str, job_description: str, error: str) -> dict[str, Any]:
    """Basic heuristic analysis when Gemini is unavailable."""
    words = set(resume_text.lower().split())
    jd_words = set(w for w in job_description.lower().split() if len(w) > 3)
    matched = sorted(list(words & jd_words))[:20]
    missing = sorted(list(jd_words - words))[:20]
    match_pct = round(len(matched) / max(len(jd_words), 1) * 100, 1)

    return {
        "ats_score": match_pct * 0.7,
        "breakdown": {"semantic_score": 0, "keyword_score": match_pct, "skill_score": 0},
        "keyword_analysis": {
            "matched": matched, "missing": missing,
            "match_percentage": match_pct, "total_jd_keywords": len(jd_words)
        },
        "skills": {
            "resume_skills": {"technical": [], "soft": []},
            "jd_skills": {"technical": [], "soft": []},
            "missing_technical_skills": [], "missing_soft_skills": []
        },
        "sections_found": ["header"],
        "scannability_audit": {
            "scannability_score": 50,
            "checks": {"action_verb_usage": False, "quantified_impact": False, "formatting_density": False},
            "tips": [f"API error: {error}. Please check GOOGLE_API_KEY."]
        },
        "ai_detection": {"ai_probability": 0, "markers": [], "analysis": "Analysis unavailable."},
        "word_count": len(resume_text.split())
    }
