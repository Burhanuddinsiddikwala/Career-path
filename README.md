# CareerPath AI — AI-Powered Career Exploration & Job Readiness Platform

CareerPath AI is a modern full-stack web platform designed to help students, recent graduates, and career changers navigate their career journeys. It combines transparent skill-based matching, prioritized skill-gap analysis, personalized 30-day learning roadmaps, an interactive learning schedule, and a context-aware AI career coaching assistant.

Aligned with **UN Sustainable Development Goal 8 (Decent Work and Economic Growth)**.

---

## 1. Executive Summary & Core Objectives

### The Problem
Early-career candidates and transitioning professionals often face information overload:
- Unclear technical requirements across rapidly shifting tech roles.
- Ambiguity regarding which missing skills to prioritize for maximum impact.
- Generic online courses that fail to deliver verifiable portfolio proof.
- Lack of personalized, contextual guidance during interview and application preparation.

### The Solution
CareerPath AI replaces guesswork with a transparent career intelligence engine:
1. **Explainable Role Alignment**: Matches user skill profiles against 12+ benchmark industry roles with documented formulas (never masquerading similarity as an employment guarantee).
2. **Prioritized Skill-Gap Analysis**: Highlights exactly which core competencies are missing and recommends practical portfolio milestones.
3. **Personalized Learning Roadmaps**: Generates ordered, persistent study milestones linked to verified educational documentation (Python, React.dev, MDN, OWASP).
4. **Context-Aware AI Assistant**: A dual-mode coaching system that incorporates user profile context to answer questions on interview preparation, resume tuning (Google XYZ formula), and networking outreach.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS + Custom Pastel Lavender SaaS Design Identity
- **Routing**: React Router 7 (`react-router-dom`)
- **Icons**: Lucide React
- **HTTP Client**: Axios (with Bearer JWT injection interceptors)
- **Typography**: DM Sans & Manrope (Google Fonts)

### Backend
- **Framework**: Python 3.11 / 3.14 + Flask 3.1
- **Cross-Origin**: Flask-CORS 6.0
- **Database**: SQLite with `PRAGMA foreign_keys = ON;` and parameterized queries
- **Authentication**: PBKDF2/scrypt password hashing (`werkzeug.security`) + HS256 JWT tokens (`pyjwt`)
- **Machine Learning & NLP**: Scikit-learn (TF-IDF vectorizer + Cosine Similarity) + NumPy

### AI Architecture
- **Local Generative Model**: Compatible with local inference providers (such as **Ollama**) hosting models like `llama3.2`, `mistral`, or `qwen2.5`.
- **Context-Aware Local Coach Fallback**: A robust, zero-cost, offline coaching engine that inspects user skills, goals, target roles, and roadmap tasks to synthesize structured, intent-driven guidance (career matching, skill gap, 30-day plans, resume advice, interview questions, networking templates).
- **Transparency**: Live status endpoint (`/api/chat/status`) that discloses the active operating mode.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  React 19 + React Router 7 + Lucide React + Tailwind CSS     │
│  (Landing, Dashboard, Careers, Skills, Jobs, Roadmap, Chat)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON (REST API)
┌──────────────────────────────▼──────────────────────────────┐
│                    Flask 3.1 API Layer                      │
│  ├── /api/auth          (Register, Login, Me, Password)     │
│  ├── /api/profile       (Profile details, Onboarding, %)    │
│  ├── /api/skills        (User Skills CRUD, Suggestions)     │
│  ├── /api/careers       (Role catalogue, Matching, Gaps)    │
│  ├── /api/roadmap       (Tasks CRUD, Roadmap Generator)     │
│  ├── /api/calendar      (Schedule & Date Milestones)        │
│  ├── /api/networking    (Contacts CRUD, Outreach Templates) │
│  ├── /api/chat          (Threads, Messages, AI Status)      │
│  └── /api/search        (Global real-time search)           │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│     SQLite Database         ││       AI Service Engine      │
│  ├── users & user_profiles  ││  ├── Ollama Local LLM API    │
│  ├── user_skills            ││  │   (llama3.2 / mistral)    │
│  ├── career_roles           ││  ├── Context-Aware Offline   │
│  ├── saved_careers          ││  │   Career Coaching Engine  │
│  ├── learning_tasks         ││  └── Scikit-learn TF-IDF     │
│  ├── networking_records     ││      Semantic Matcher        │
│  └── conversations & msgs   │└──────────────────────────────┘
└─────────────────────────────┘
```

---

## 4. Database Schema (SQLite)

All tables use parameterized SQL queries with foreign keys enabled:

1. `users`: User identity, email (unique), hashed password, full name, timestamps.
2. `user_profiles`: Academic background, field of study, career stage, location preference, target role, goals, onboarding status.
3. `user_skills`: User-owned competencies, proficiency (10–100%), category, years of experience.
4. `career_roles`: Seeded catalogue of 12 benchmark roles with responsibilities, required skills, related skills, learning steps, and resources (stored as JSON arrays).
5. `saved_careers`: Target roles bookmarked by the user with custom notes.
6. `learning_tasks`: Personalized study milestones with status (`pending`/`completed`), priority, duration, target dates, and external resource links.
7. `networking_records`: Professional contacts, organization, role title, outreach status, follow-up dates, and conversation notes.
8. `conversations`: Persistent chat threads associated with the authenticated user.
9. `conversation_messages`: Message history (role: `user`/`assistant`, content, metadata, action buttons).
10. `notifications`: In-app event alerts with read status tracking.
11. `match_history`: Audit log of career matching queries and scoring methods.

---

## 5. Quick Start (Windows PowerShell)

### Prerequisites
- Python 3.11+ (or Python 3.14)
- Node.js 20.19+ or 22.12+ (LTS)
- PowerShell (or Command Prompt)

### Step 1: Clone & Open Terminal
```powershell
cd CareerPathAI_Starter
```

### Step 2: Start the Backend API
In your first terminal:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
python app.py
```
> The Flask API will start at **http://127.0.0.1:5000**. Database tables and catalogue roles are seeded automatically.

### Step 3: Start the Frontend UI
In a second terminal:
```powershell
cd frontend
npm install
npm run dev
```
> Open your browser at **http://localhost:5173**.

---

## 6. One-Click Batch Scripts (Windows)
For convenience, helper scripts are provided in the repository root:
- `start_backend.bat`: Launches the virtual environment and Flask API.
- `start_frontend.bat`: Launches the Vite development server.
- `run_tests.bat`: Runs all unit, integration, and evaluation test suites.

---

## 7. Automated Testing Suite

The repository includes comprehensive automated test suites:

### 1. Backend Unit & API Tests
Verifies 14 core backend requirements including authentication, password hashing, skill CRUD, career matching, roadmap generation, and cross-user data isolation:
```powershell
cd backend
.\.venv\Scripts\activate.ps1
python test_backend.py
```

### 2. End-to-End User Journey Simulation
Simulates the complete user lifecycle: Registration → Onboarding → Skill Tuning → Career Matching → Role Saving → Roadmap Generation → Task Completion → Networking Hub → AI Chat Persistence → Session Reload → User Isolation:
```powershell
cd backend
python test_e2e_journey.py
```

### 3. Career Matching Evaluation Harness
Compares baseline skill overlap against semantic matching across representative benchmark profiles:
```powershell
cd backend
python evaluate.py
```

### 4. Frontend Production Build Check
```powershell
cd frontend
npm run build
```

---

## 8. Optional Local Generative AI Setup (Ollama)

CareerPath AI functions 100% out-of-the-box using the built-in Context-Aware Career Coaching Engine without requiring an external model or API key.

To activate local generative language modeling:
1. Download and install [Ollama](https://ollama.com/).
2. Pull your desired model in a terminal:
   ```powershell
   ollama run llama3.2
   ```
3. Ensure Ollama is running at `http://127.0.0.1:11434`.
4. In `backend/.env`, verify:
   ```env
   OLLAMA_BASE_URL=http://127.0.0.1:11434
   OLLAMA_MODEL=llama3.2
   ```
5. CareerPath AI will automatically detect the local LLM and activate Generative Mode. Check `/api/chat/status` or the Settings page diagnostics panel to verify.

---

## 9. Public Deployment Guide

### Deployment Topology
- **Frontend**: Deploy to Vercel, Netlify, or Cloudflare Pages.
  - Set `VITE_API_URL` to your production backend URL (e.g. `https://api.yourdomain.com`).
- **Backend**: Deploy to Render, Railway, or Fly.io with a persistent volume.
  - Set `FRONTEND_ORIGIN` to your production frontend URL (e.g. `https://yourdomain.com`).
  - Set `JWT_SECRET_KEY` to a cryptographically secure random string (64+ characters).
  - Mount a persistent disk for `careerpath.db` so user activity persists across restarts.

---

## 10. Security & Ethical Disclaimers

1. **Security**:
   - Passwords hashed using PBKDF2/scrypt.
   - JWT tokens signed with HS256 and subject to expiration.
   - Server-side authorization enforced on every private endpoint (`user_id` is derived strictly from validated JWTs, preventing Insecure Direct Object References).
2. **Ethical AI & Methodological Disclosure**:
   - Match scores represent profile-to-role similarity calculated from curated benchmark descriptions.
   - Match scores are **not** probabilities of employment and do not constitute hiring guarantees.
   - Role descriptions represent standard industry benchmarks rather than live vacancies.
   - Verified educational resource links direct users to official documentation (Python.org, React.dev, MDN, OWASP).
