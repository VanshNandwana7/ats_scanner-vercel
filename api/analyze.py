"""POST /api/analyze — main resume analysis endpoint."""
import json
import sys
import os
import cgi
import io

# Make lib/ importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from http.server import BaseHTTPRequestHandler
from lib.parser import extract_text
from lib.analyzer import analyze_resume
from lib.optimizer import detect_ai_origin

ALLOWED_ORIGINS = ["*"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _cors_headers(handler_instance):
    handler_instance.send_header("Access-Control-Allow-Origin", "*")
    handler_instance.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
    handler_instance.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        _cors_headers(self)
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > MAX_FILE_SIZE:
                self._error(400, "File too large. Max 10MB.")
                return

            content_type = self.headers.get("Content-Type", "")
            body = self.rfile.read(content_length)

            # Parse multipart form data
            environ = {
                "REQUEST_METHOD": "POST",
                "CONTENT_TYPE": content_type,
                "CONTENT_LENGTH": str(content_length),
            }
            form = cgi.FieldStorage(
                fp=io.BytesIO(body),
                environ=environ,
                keep_blank_values=True
            )

            # Extract file
            if "resume" not in form:
                self._error(400, "Missing 'resume' file field.")
                return

            resume_field = form["resume"]
            file_bytes = resume_field.file.read()
            filename = resume_field.filename or "resume.pdf"

            ext = filename.rsplit(".", 1)[-1].lower()
            if ext not in ("pdf", "docx", "doc"):
                self._error(400, f"Unsupported file type: .{ext}")
                return

            # Extract job description
            if "job_description" not in form:
                self._error(400, "Missing 'job_description' field.")
                return
            job_description = form["job_description"].value.strip()

            # Run analysis
            resume_text = extract_text(file_bytes, filename)
            results = analyze_resume(resume_text, job_description)

            # Inject extra fields
            results["status"] = "success"
            results["filename"] = filename
            results["resume_text"] = resume_text
            results["job_description"] = job_description

            self._json(200, results)

        except Exception as e:
            self._error(500, str(e))

    def _json(self, status: int, data: dict):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        _cors_headers(self)
        self.end_headers()
        self.wfile.write(body)

    def _error(self, status: int, message: str):
        self._json(status, {"error": message, "detail": message})

    def log_message(self, format, *args):
        pass  # Suppress default logging
