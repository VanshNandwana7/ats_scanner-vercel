# ATSGuard AI — Vercel Edition 🚀

A production-ready, Vercel-native ATS resume scanner. Both **backend** and **frontend** deploy to Vercel — zero servers, zero ops.

## 🌟 Features

- **ATS Semantic Scoring** — Gemini AI analyzes your resume vs job description
- **7-Second Rule Audit** — Scannability, action verbs, quantified impact
- **AI Authenticity Meter** — Detects AI-generated content
- **Humanify Rewriter** — Rewrites robotic bullet points to sound human
- **Keyword Gap Analysis** — Matched vs missing keywords from the JD

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Python Serverless (Vercel Functions) |
| AI Engine | Google Gemini 1.5 Flash |
| PDF Parsing | PyMuPDF + python-docx |
| Hosting | Vercel (both frontend & backend) |

## 📁 Project Structure

```
ats-scanner-vercel/
├── api/                    ← Vercel Serverless Python Functions
│   ├── analyze.py          ← POST /api/analyze
│   ├── suggest.py          ← POST /api/suggest
│   ├── humanify.py         ← POST /api/humanify
│   └── health.py           ← GET /api/health
├── lib/                    ← Shared Python Utilities
│   ├── parser.py           ← PDF/DOCX text extraction
│   ├── analyzer.py         ← Gemini-powered ATS analysis
│   └── optimizer.py        ← Suggestions, humanify, AI detection
├── src/                    ← React Frontend
│   ├── components/
│   │   ├── UploadSection.jsx
│   │   └── ResultsDashboard.jsx
│   ├── lib/
│   │   └── api.js          ← Centralized API calls (no hardcoded URLs)
│   ├── App.jsx
│   └── index.css
├── vercel.json             ← Vercel routing configuration
├── requirements.txt        ← Python deps (lightweight, < 250MB)
└── package.json            ← Frontend deps
```

## 🚀 Deploy to Vercel

### Prerequisites
- Vercel account ([vercel.com](https://vercel.com))
- Google Gemini API Key ([aistudio.google.com](https://aistudio.google.com/app/apikey))
- Vercel CLI: `npm i -g vercel`

### 1. Connect to Vercel

```bash
# Login
vercel login

# Deploy (from this directory)
vercel
```

### 2. Set Environment Variable

In the Vercel dashboard → Settings → Environment Variables:

| Key | Value |
|---|---|
| `GOOGLE_API_KEY` | `your_gemini_api_key_here` |

Or via CLI:
```bash
vercel env add GOOGLE_API_KEY
```

### 3. Deploy to Production

```bash
vercel --prod
```

Your app will be live at: `https://ats-scanner-vercel.vercel.app`

---

## 💻 Local Development

```bash
# Install frontend deps
npm install

# Install Python deps
pip install -r requirements.txt

# Start Vite dev server (proxies /api to localhost:8000)
npm run dev
```

For local serverless function testing:
```bash
# Install Vercel CLI
npm i -g vercel

# Run full stack locally
vercel dev
```

Set your `GOOGLE_API_KEY` in a `.env.local` file:
```
GOOGLE_API_KEY=your_key_here
```

## 📄 License
MIT License
# ats-scanner
