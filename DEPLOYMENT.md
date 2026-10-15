# CareerPath AI — Production Deployment Guide

> **Document Version**: 1.1.0  
> **Platform**: CareerPath AI SaaS  
> **Target Environments**: Docker / Docker Compose, Render, Railway, Vercel, Netlify

---

## 1. Architecture Overview

CareerPath AI utilizes a decoupled modern web architecture:

```
┌────────────────────────────────┐         ┌────────────────────────────────┐
│        Frontend (SPA)          │         │       Backend (REST API)       │
│  - React 19.2 + Vite 8.3       │         │  - Python 3.11/3.14 + Flask    │
│  - Tailwind CSS + Lucide       │         │  - Gunicorn WSGI Server        │
│  - Hosted on Vercel / Netlify  │         │  - Hosted on Render / Railway  │
│    or Nginx Docker Container   │         │  - SQLite 3 (Persistent Volume)│
└───────────────┬────────────────┘         └───────────────┬────────────────┘
                │                                          │
                │ HTTPS JSON REST API                      │
                ▼                                          ▼
   Browser Client Requests                     ┌───────────────────────┐
   Bearer Authorization (JWT)                  │     AI Subsystems     │
                                               │ 1. Ollama (Local LLM) │
                                               │ 2. Google Gemini API  │
                                               │ 3. Offline AI Coach   │
                                               └───────────────────────┘
```

---

## 2. One-Click Deployment via Docker Compose

The fastest way to spin up the entire platform locally or on a VPS (DigitalOcean, Linode, AWS EC2, Hetzner) is via Docker Compose.

### Prerequisites
- Docker Engine 24+
- Docker Compose v2+

### Quick Start
```bash
# Clone the repository
git clone <repository_url>
cd CareerPathAI_Starter

# (Optional) Configure environment variables in a .env file or export them
export JWT_SECRET_KEY="a-secure-random-64-character-string-for-production"
export GEMINI_API_KEY="your-gemini-api-key"

# Build and start both frontend and backend
docker compose up --build -d

# Check running services
docker compose ps

# View backend logs
docker compose logs -f backend
```

Once running:
- **Frontend Application**: `http://localhost:80` (or `http://localhost`)
- **Backend API**: `http://localhost:5000/api/health`
- **Data Persistence**: SQLite database is persisted in the Docker volume `careerpath-sqlite-data` mounted at `/app/data/careerpath.db`.

To stop services:
```bash
docker compose down
```

---

## 3. Backend Deployment on Render.com

Render is ideal for hosting the Flask backend with an attached persistent disk for SQLite.

### Step 1: Create a New Web Service
1. Connect your GitHub/GitLab repository to Render.
2. Select **Web Service**.
3. Set the **Root Directory** to `backend`.
4. Choose **Docker** as the Environment (Render detects `backend/Dockerfile`), or choose **Python 3** with:
   - **Build Command**: `pip install -r requirements.txt gunicorn`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120 app:app`

### Step 2: Attach a Persistent Disk
1. In the Web Service settings on Render, navigate to **Disks**.
2. Click **Add Disk**:
   - **Name**: `careerpath-data`
   - **Mount Path**: `/app/data`
   - **Size**: 1 GB (sufficient for thousands of users and roadmaps)

### Step 3: Configure Environment Variables
In the **Environment** tab, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `FLASK_ENV` | `production` | Enables production mode |
| `DATABASE_PATH` | `/app/data/careerpath.db` | Points database to the persistent disk |
| `JWT_SECRET_KEY` | `generate-a-random-64-char-hex-secret` | Signs and verifies user session tokens |
| `TOKEN_EXPIRY_DAYS` | `7` | Days before auth token requires re-login |
| `FRONTEND_ORIGIN` | `https://careerpath-ai.vercel.app` | Allowed CORS origin (comma-separated if multiple) |
| `GEMINI_API_KEY` | `AIzaSy...` | (Optional) Enables Google Gemini generative AI |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Target Gemini model |

---

## 4. Backend Deployment on Railway.app

1. Open Railway and click **New Project** > **Deploy from GitHub repo**.
2. Under Settings for the service:
   - Set **Root Directory** to `/backend`.
3. Add a **Persistent Volume**:
   - Volume Mount Path: `/app/data`
4. Set **Variables**:
   - `DATABASE_PATH`: `/app/data/careerpath.db`
   - `JWT_SECRET_KEY`: `<secure-random-64-byte-string>`
   - `FRONTEND_ORIGIN`: `https://your-frontend.vercel.app`
   - `GEMINI_API_KEY`: `<optional-api-key>`
5. Railway will automatically build using `backend/Dockerfile` and map `$PORT`.

---

## 5. Frontend Deployment on Vercel

Vercel provides global CDN edge distribution for the Vite React frontend.

### Step 1: Import Project
1. In Vercel, click **Add New Project** and select your repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite** (auto-detected).
4. Build Command: `npm run build`
5. Output Directory: `dist`

### Step 2: Environment Variables
Add the following variable in the Vercel project settings:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-backend-service.onrender.com` | Live backend API URL (omit trailing slash) |

### Step 3: Single Page App (SPA) Routing
The repository includes `frontend/vercel.json` with rewrite rules so that deep links (`/careers`, `/skills`, `/chat`, `/dashboard`) route seamlessly to `index.html`.

---

## 6. Frontend Deployment on Netlify

1. In Netlify, click **Add new site** > **Import an existing project**.
2. Select your repository.
3. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Environment Variables:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com`
5. The SPA fallback is automatically handled by `frontend/public/_redirects`.

---

## 7. Production Security Best Practices

1. **JWT Secret Strength**:
   Always generate a cryptographically strong 64-character secret for production:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
2. **CORS Restrictions**:
   Never leave `FRONTEND_ORIGIN` set to `*` in production. Always specify the exact domain(s) of your frontend (e.g. `https://careerpath.ai,https://www.careerpath.ai`).
3. **Database Backups**:
   To backup your SQLite database while running:
   ```bash
   # From host running Docker
   docker exec careerpath-backend sqlite3 /app/data/careerpath.db ".backup '/app/data/backup_$(date +%F).db'"
   ```
4. **HTTPS / SSL**:
   When using Render, Railway, Vercel, or Cloudflare, TLS/SSL certificates are provisioned and renewed automatically at zero cost.

---

## 8. Continuous Integration (CI/CD)

The repository includes a complete GitHub Actions workflow (`.github/workflows/ci.yml`). Every commit or pull request automatically executes:
1. **Backend Unit & API Tests**: 14 tests verifying authentication, data isolation, role matching, roadmaps, and notifications.
2. **End-to-End User Simulation**: Full 12-stage user journey verification.
3. **Matching Evaluation Harness**: Benchmark validation ensuring 100% agreement.
4. **Frontend Production Build**: Vite 8 compilation and artifact bundle verification.
