from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from mangum import Mangum

# Correct pathing so the Vercel builder can discover local lib imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from lib.parser import extract_text
from lib.analyzer import analyze_resume
from lib.optimizer import generate_suggestions, humanify_text

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

# Fix CORS completely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze(resume: UploadFile = File(...), job_description: str = Form(...)):
    file_bytes = await resume.read()
    resume_text = extract_text(file_bytes, resume.filename)
    results = analyze_resume(resume_text, job_description)
    results["resume_text"] = resume_text
    results["job_description"] = job_description
    results["filename"] = resume.filename
    return results

@app.post("/api/suggest")
async def suggest(request: Request):
    body = await request.json()
    return generate_suggestions(
        body["resume_text"],
        body["job_description"],
        body["missing_keywords"]
    )

@app.post("/api/humanify")
async def humanify(request: Request):
    body = await request.json()
    humanified = humanify_text(body["text"])
    return {"original": body["text"], "humanified": humanified}

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "Vercel FastAPI backend powered by Mangum"}

# Create handler for Vercel
handler = Mangum(app)
