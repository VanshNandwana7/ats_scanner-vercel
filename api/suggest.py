"""POST /api/suggest — AI resume bullet-point suggestions."""
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from http.server import BaseHTTPRequestHandler
from lib.optimizer import generate_suggestions


def _cors_headers(h):
    h.send_header("Access-Control-Allow-Origin", "*")
    h.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
    h.send_header("Access-Control-Allow-Headers", "Content-Type")


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        _cors_headers(self)
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length).decode())

            resume_text = body.get("resume_text", "")
            job_description = body.get("job_description", "")
            missing_keywords = body.get("missing_keywords", [])

            if not resume_text or not job_description:
                self._json(400, {"error": "Missing resume_text or job_description."})
                return

            suggestions = generate_suggestions(resume_text, job_description, missing_keywords)
            self._json(200, suggestions)

        except Exception as e:
            self._json(500, {"error": str(e)})

    def _json(self, status: int, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        _cors_headers(self)
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass
