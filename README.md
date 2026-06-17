# SBI Setu 🌉

**Aapke aur SBI ke beech ka Setu**

Agentic AI platform bridging customers to SBI banking — reducing branch queues through intelligent pre-visit deflection, in-branch automation, and real-time staff intelligence.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## The Problem

Indian public sector bank branches face a structural mismatch every day:

- **Cash and account service queues overflow** — customers wait 30–45 minutes for tasks that could be done digitally
- **Loan desks sit empty** — while walk-ins pile up at cash counters, loan officers have 60–70% idle capacity
- **Staff miss lunch till 3 PM** — peak-hour rush (11 AM–2 PM) leaves no breathing room for branch teams
- **Server crashes at peak hours** — legacy core systems buckle under sudden footfall spikes
- **Low YONO adoption** — millions of customers still visit branches for balance checks, passbook updates, and KYC that YONO already supports

**Result:** frustrated customers, underutilized loan capacity, burnt-out staff, and missed digital adoption targets across **22,000+ SBI branches**.

---

## The Solution

**SBI Setu** is a 3-agent agentic AI platform that attacks branch congestion from three angles — before, during, and after the customer arrives.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SBI SETU — 3 AGENTS                         │
├─────────────────┬─────────────────────┬────────────────────────────┤
│    SAARTHI      │     SWIFTDESK       │        BRANCHOS            │
│  Pre-Visit AI   │   In-Branch Kiosk   │   Staff Intelligence       │
│  Deflect visits │   Self-service flow │   Real-time dashboard      │
│  WhatsApp-style │   Token + loan check│   Footfall + server health │
└─────────────────┴─────────────────────┴────────────────────────────┘
```

### 🤖 Saarthi — Pre-Visit WhatsApp AI
A Hinglish AI assistant that intercepts customers **before** they leave home. Handles balance queries, passbook updates, FD opening, KYC guidance, and loan enquiries — routing to YONO wherever possible. Powered by **Groq Llama 3.3 70B** with keyword intent detection for instant responses.

### ⚡ SwiftDesk — In-Branch Kiosk
A touch-friendly self-service kiosk for customers who do visit. 4-step flow: select service → fill details (with DigiLocker mock auto-fill) → loan eligibility check → token generation with queue position and counter assignment.

### 📊 BranchOS — Staff Intelligence Dashboard
A real-time command center for branch managers. Live footfall, counter queue status, server health monitoring, AI-generated insights, and Saarthi deflection protocol alerts when footfall exceeds thresholds.

---

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://sbi-setu.onrender.com](https://sbi-setu.onrender.com) |
| **Backend API** | [https://sbi-setu-api.onrender.com](https://sbi-setu-api.onrender.com) |
| **Health Check** | [https://sbi-setu-api.onrender.com/health](https://sbi-setu-api.onrender.com/health) |

> ⚠️ **Note:** The backend runs on Render's free tier and **sleeps after ~15 minutes of inactivity**. The first request after sleep may take **30–60 seconds** to wake up. Subsequent requests are fast.

**Quick test routes:**
- Landing → [sbi-setu.onrender.com](https://sbi-setu.onrender.com)
- Saarthi chat → [sbi-setu.onrender.com/saarthi](https://sbi-setu.onrender.com/saarthi)
- SwiftDesk kiosk → [sbi-setu.onrender.com/swiftdesk](https://sbi-setu.onrender.com/swiftdesk)
- BranchOS dashboard → [sbi-setu.onrender.com/branchos](https://sbi-setu.onrender.com/branchos)

---

## Features

### Landing Page `/`

| Feature | Status |
|---------|--------|
| Full-viewport hero with SBI Setu branding | ✅ |
| Stats bar (22,000+ branches, 40–60% queue reduction) | ✅ |
| 3 clickable agent cards with hover animations | ✅ |
| CTA buttons — Try Saarthi / View Dashboard | ✅ |
| Mobile responsive design | ✅ |

### Saarthi `/saarthi`

| Feature | Status |
|---------|--------|
| WhatsApp-style chat interface | ✅ |
| Welcome message in Hinglish on load | ✅ |
| Keyword intent detection (balance, loan, passbook, cash, FD, KYC) | ✅ |
| Groq AI fallback for open-ended queries | ✅ |
| Inline loan eligibility mini-form | ✅ |
| Animated typing indicator | ✅ |
| Book Token CTA for cash withdrawal queries | ✅ |
| Session persistence to Supabase `chat_logs` | ✅ |
| Conversation history with session ID | ✅ |

### SwiftDesk `/swiftdesk`

| Feature | Status |
|---------|--------|
| 4-step progress stepper (Service → Details → Eligibility → Token) | ✅ |
| Touch-friendly kiosk UI (min 16px fonts) | ✅ |
| Service selection: Account, Loan, KYC, Passbook | ✅ |
| Form validation (Aadhaar, PAN, mobile) | ✅ |
| DigiLocker auto-fill mock | ✅ |
| Real-time loan eligibility calculator | ✅ |
| Unique token generation with queue position | ✅ |
| SMS token mock notification | ✅ |
| Token persistence to Supabase `tokens` | ✅ |

### BranchOS `/branchos`

| Feature | Status |
|---------|--------|
| Live clock + branch name header | ✅ |
| 4 stat cards (footfall, wait time, deflected, loan utilization) | ✅ |
| High footfall alert banner (threshold > 100) | ✅ |
| Hourly footfall Recharts line chart (9 AM–5 PM) | ✅ |
| Counter status table with agent assignments | ✅ |
| Click-to-redirect Saarthi deflection action | ✅ |
| Server health panel (CPU, RAM, DB connections, API latency) | ✅ |
| AI insights panel with recommendations | ✅ |
| Send Alert to IT mock | ✅ |
| Today's token count from Supabase | ✅ |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 19 |
| | Vite | 6 |
| | Tailwind CSS | 3.4 |
| | React Router | 6.28 |
| | Axios | 1.7 |
| **Backend** | FastAPI | 0.115 |
| | Python | 3.11 |
| | Uvicorn | latest |
| | Pydantic | 2.x |
| **AI** | Groq API | Llama 3.3 70B Versatile |
| **Database** | Supabase (PostgreSQL) | 17 |
| **Charts** | Recharts | 2.15 |
| **Icons** | Lucide React | 0.469 |
| **Deployment** | Render (Blueprint) | Free tier |

---

## API Endpoints

Base URL: `https://sbi-setu-api.onrender.com`

### Core

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check — returns `{ status, service }` |

### Saarthi

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/saarthi/chat` | Send message, get AI reply. Body: `{ message, session_id?, history[] }`. Returns: `{ reply, session_id, intent }`. Logs to `chat_logs`. |

### SwiftDesk

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/swiftdesk/token` | Generate queue token. Body: `{ service, name, aadhaar_last4? }`. Returns: `{ token, counter, wait_minutes, queue_position }`. Persists to `tokens`. |
| `GET` | `/api/swiftdesk/tokens` | Returns last 20 tokens from Supabase |
| `PUT` | `/api/swiftdesk/token/{token_number}/status` | Update token status (`waiting` / `serving` / `done`) |

### BranchOS

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/branchos/stats` | Full dashboard data + today's token count from Supabase |
| `POST` | `/api/branchos/footfall` | Log hourly footfall. Body: `{ hour, walk_ins, deflected, branch_id? }` |
| `GET` | `/api/branchos/history` | Last 7 days of footfall logs from Supabase |

---

## Architecture

```
┌──────────────┐     HTTPS      ┌─────────────────────┐
│              │ ──────────────▶  │   Render Static     │
│    User      │                  │   (React Frontend)  │
│  (Browser)   │ ◀──────────────  │  sbi-setu.onrender  │
│              │     HTML/JS/CSS  └──────────┬──────────┘
└──────────────┘                             │ REST API
                                             │ (Axios)
                                             ▼
                              ┌──────────────────────────┐
                              │   Render Web Service     │
                              │   (FastAPI Backend)      │
                              │  sbi-setu-api.onrender   │
                              └──────┬──────────┬────────┘
                                     │          │
                          ┌──────────▼──┐   ┌───▼──────────────┐
                          │  Groq API   │   │    Supabase      │
                          │ Llama 3.3   │   │   PostgreSQL     │
                          │   70B       │   │  chat_logs       │
                          │  (Saarthi)  │   │  tokens          │
                          └─────────────┘   │  footfall_logs   │
                                            └──────────────────┘
```

**Data flow:**
1. User interacts with React frontend on Render static hosting
2. Frontend calls FastAPI backend via Axios (`VITE_API_URL`)
3. Saarthi chat → Groq API for AI responses + Supabase for chat logs
4. SwiftDesk tokens → generated server-side + persisted to Supabase
5. BranchOS dashboard → mock real-time data + live token counts from Supabase

---

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Groq API key ([console.groq.com](https://console.groq.com))
- Supabase project ([supabase.com](https://supabase.com))

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

```bash
uvicorn main:app --reload
# API runs at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
# App runs at http://localhost:5173
```

### Database Setup

Run `supabase_schema.sql` in your Supabase SQL Editor to create the required tables.

---

## Database Schema

Defined in [`supabase_schema.sql`](./supabase_schema.sql):

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `chat_logs` | Saarthi conversation history | `session_id`, `role`, `message`, `intent`, `created_at` |
| `tokens` | SwiftDesk queue tokens | `token_number`, `service`, `customer_name`, `counter`, `status`, `created_at` |
| `footfall_logs` | BranchOS hourly analytics | `hour`, `walk_ins`, `deflected`, `branch_id`, `logged_at` |

All tables have Row Level Security enabled with permissive dev policies. Use the **service_role** key in production.

---

## Business Model

**B2B SaaS for Public Sector Banks (PSBs)**

| Tier | Target | Price (indicative) |
|------|--------|-------------------|
| **Pilot** | 1 branch, 3 months | Free / subsidized |
| **Branch** | Single branch license | ₹15,000/month |
| **Regional** | 50–200 branches | ₹8,000/branch/month |
| **Enterprise** | 500+ branches (SBI-scale) | Custom pricing |

**Market size:** SBI alone operates **22,000+ branches** serving 500M+ customers. Even 10% digital deflection across the network saves an estimated **₹2,000+ crore annually** in operational costs.

**Revenue streams:**
- Per-branch SaaS subscription
- Implementation and onboarding fees
- Analytics and insights premium tier
- White-label licensing to other PSBs (PNB, BoB, Canara Bank)

---

## Hackathon

**Built for SBI Hackathon @ GFF 2026**

| | |
|---|---|
| **Event** | SBI Hackathon @ Global Fintech Fest 2026 |
| **Category** | Digital Adoption |
| **Theme** | Agentic AI & Emerging Technologies |
| **Problem** | Branch congestion, low digital adoption, staff burnout |
| **Solution** | 3-agent AI platform bridging customers to digital banking |

---

## Screenshots

> Screenshots coming soon — replace paths after adding images to `/docs/screenshots/`

### Landing Page
![SBI Setu Landing Page — hero section with 3 agent cards and stats bar](./docs/screenshots/landing.png)
*Landing page with hero, stats bar, and agent cards*

### Saarthi Chat
![Saarthi WhatsApp-style AI chat interface in Hinglish](./docs/screenshots/saarthi.png)
*Saarthi — Hinglish AI assistant with intent detection and loan eligibility form*

### SwiftDesk Kiosk
![SwiftDesk in-branch kiosk with 4-step flow and token generation](./docs/screenshots/swiftdesk.png)
*SwiftDesk — touch-friendly kiosk with token generation*

### BranchOS Dashboard
![BranchOS staff dashboard with footfall chart and counter status](./docs/screenshots/branchos.png)
*BranchOS — real-time branch intelligence dashboard*

---

## Future Roadmap

- [ ] **Multi-language support** — Hindi, Tamil, Bengali, Marathi for Saarthi
- [ ] **Voice input for SwiftDesk** — hands-free kiosk for elderly customers
- [ ] **Predictive ML model** — footfall forecasting using historical `footfall_logs` data
- [ ] **Multi-branch rollout** — centralized dashboard across branch network
- [ ] **Core banking API integration** — real account balance, real token booking via Finacle
- [ ] **WhatsApp Business API** — deploy Saarthi on actual WhatsApp
- [ ] **YONO deep links** — one-tap redirect from Saarthi to YONO app actions

---

## Author

**Ayush Anand**  
B.Tech CSE (IoT & Intelligent Systems) — Manipal University Jaipur

[![GitHub](https://img.shields.io/badge/GitHub-ayushanand27-181717?logo=github)](https://github.com/ayushanand27)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ayush_Anand-0A66C2?logo=linkedin)](https://linkedin.com/in/ayush-anand-457569221)

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Deploy (Render)

### One-click Blueprint deploy

1. Push this repo to GitHub: [ayushanand27/SBI-SETU](https://github.com/ayushanand27/SBI-SETU)
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect the `SBI-SETU` repo — Render reads `render.yaml` automatically
4. When prompted, set these **secret** env vars for `sbi-setu-api`:
   - `GROQ_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
5. Wait ~5 minutes for both services to build

| Service | URL |
|---------|-----|
| Frontend | https://sbi-setu.onrender.com |
| Backend | https://sbi-setu-api.onrender.com |

> Free tier backends spin down after ~15 min idle — first request may take 30–60s to wake up.

### Alternative: Railway

Deploy backend only via [`railway.toml`](./railway.toml). Host frontend on Render static or Vercel with `VITE_API_URL` pointing to your Railway URL.
