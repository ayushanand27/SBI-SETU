# SBI Setu 🌉

Aapke aur SBI ke beech ka Setu  
Agentic AI platform bridging customers to SBI banking  
SBI Hackathon @ GFF 2026

## Local Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deploy (Render — recommended, free tier)

1. Push this repo to GitHub: [ayushanand27/SBI-SETU](https://github.com/ayushanand27/SBI-SETU)
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect the `SBI-SETU` repo — Render reads `render.yaml` automatically
4. When prompted, set these **secret** env vars for `sbi-setu-api`:
   - `GROQ_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
5. Wait ~5 min for both services to build

**Live URLs (after deploy):**

| Service  | URL |
|----------|-----|
| Frontend | https://sbi-setu.onrender.com |
| Backend  | https://sbi-setu-api.onrender.com |

> Free tier backends spin down after ~15 min idle — first request may take 30–60s to wake up.

### Alternative: Railway

Deploy backend only via `railway.toml`. Host frontend on Render static or Vercel with `VITE_API_URL` pointing to your Railway URL.

## Architecture

3-agent system: Saarthi (pre-visit) + SwiftDesk (in-branch) + BranchOS (staff)
