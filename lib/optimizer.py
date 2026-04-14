"""
Gemini-powered optimizer: suggestions, AI detection, humanify.
"""
import os
import json
import re
from typing import List, Dict, Any


def _get_model():
    import google.generativeai as genai
    api_key = os.environ.get("GOOGLE_API_KEY", "")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")


def _call_gemini(prompt: str) -> str:
    model = _get_model()
    response = model.generate_content(prompt)
    return response.text.strip().replace("```json", "").replace("```", "").strip()


def generate_suggestions(
    resume_text: str, job_description: str, missing_keywords: List[str]
) -> List[Dict[str, str]]:
    prompt = f"""
You are an expert ATS optimization consultant.
Resume (excerpt): {resume_text[:2000]}
Job Description: {job_description[:1500]}
Missing Keywords: {', '.join(missing_keywords[:10])}

Generate 3 high-impact resume bullet point improvements.
Return ONLY a JSON array:
[
  {{"original": "old bullet text", "optimized": "improved bullet with keywords and metrics", "reason": "why this helps"}},
  {{"original": "...", "optimized": "...", "reason": "..."}}
]
"""
    try:
        text = _call_gemini(prompt)
        return json.loads(text)
    except Exception as e:
        kw = missing_keywords[0] if missing_keywords else "relevant technologies"
        return [
            {
                "original": "Worked on various backend projects.",
                "optimized": f"Architected high-scale microservices using {kw}, reducing latency by 35%.",
                "reason": f"Integrates the missing keyword '{kw}' with quantified impact."
            },
            {
                "original": "Responsible for maintaining APIs.",
                "optimized": "Streamlined REST API delivery with CI/CD pipelines, cutting deployment time by 40%.",
                "reason": "Stronger action verbs and measurable outcomes."
            },
            {
                "original": "Collaborated with team.",
                "optimized": "Led cross-functional team of 6 engineers to deliver 3 product features ahead of schedule.",
                "reason": "Adds leadership signal and specific numbers."
            }
        ]


def humanify_text(text: str) -> str:
    prompt = f"""
Rewrite the following resume bullet point to sound natural, human, and authentic
while keeping it professional and impactful. Avoid robotic buzzwords like
'spearheaded', 'leveraging', or 'synergized'.

Original: {text}

Return ONLY the rewritten text. No explanation. No quotes.
"""
    try:
        return _call_gemini(prompt)
    except Exception:
        return text


def detect_ai_origin(text: str) -> Dict[str, Any]:
    # Quick heuristic first
    buzzwords = {
        "meticulously", "delve", "tapestry", "embark", "spearhead",
        "leveraging", "seamless", "comprehensive", "robust", "transformative",
        "underscore", "vibrant", "pioneer", "unwavering", "resonate"
    }
    found = [w for w in text.lower().split() if w.strip(".,;:") in buzzwords]
    heuristic = min(100, len(found) * 15)

    prompt = f"""
Analyze the following text and determine the probability (0-100) it was written by an AI.
Text: {text[:1500]}

Consider: overuse of flowery language, perfect grammar, lack of personal anecdotes.

Return ONLY valid JSON:
{{"ai_probability": <number>, "markers": ["word1", "word2"], "analysis": "short explanation"}}
"""
    try:
        result = json.loads(_call_gemini(prompt))
        return result
    except Exception:
        return {
            "ai_probability": heuristic,
            "markers": found[:5],
            "analysis": "Heuristic analysis based on common LLM vocabulary."
        }
