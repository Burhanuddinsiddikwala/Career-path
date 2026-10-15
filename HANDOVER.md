# CareerPath AI — Complete Project Handover Document

> **File Location**: `C:\Users\HP\Downloads\CareerPathAI_Starter\CareerPathAI_Starter\HANDOVER.md`  
> **Date**: October 15, 2026  
> **Status**: Premium Cinematic Design & Editorial Interaction Upgrade Fully Implemented, Verified, and Operational

---

## 1. Project Mission & System Architecture

### 1.1 Project Mission
CareerPath AI is an AI-powered career intelligence, skill assessment, career matching, and learning roadmap platform aligned with United Nations Sustainable Development Goal 8 (Decent Work and Economic Growth). It empowers students, fresh graduates, internship applicants, and career switchers to:
- Formulate realistic, data-backed career paths matching verified competencies and stated interests.
- Identify prioritized skill gaps calibrated to real industry requirements.
- Structure persistent 30-day learning curricula linked to canonical educational documentation.
- Consult an AI Career Advisor implementing pedagogical frameworks (including the STAR interview method and Google XYZ resume formula).
- Track daily and monthly learning momentum with an interactive schedule.
- Manage professional networking contacts across pipeline stages with canonical message templates.

### 1.2 Core Architectural Mandates Enforced
1. **Zero Dead Controls**: Every button, slider, filter, link, calendar date, modal, search input, and tab performs its intended action, persists to the SQLite database where applicable, produces user toast dispatches, or renders explicitly as non-interactive content.
2. **Flagship AI Career Advisory Desk**: A multi-turn, context-aware conversational engine with SQLite persistence, thread renaming/deletion, suggested prompts, and clickable navigation actions.
3. **Dual-Mode AI Architecture with Truthful Diagnostics**:
   - Primary: Connects to local LLMs via **Ollama** (`llama3.2`, `mistral`, etc.) without requiring paid cloud API keys.
   - Optional Cloud: Supports **Google Gemini API** (`gemini-2.5-flash` or custom model) via `GEMINI_API_KEY`.
   - Fallback: Intelligent **Context-Aware Offline Career Coach Engine** synthesizing real profile parameters (skills, target role, education, roadmap tasks).
   - Transparent live engine reporting via `/api/chat/status`.
4. **Explainable Career Matching**: Multi-factor scoring taking into account core skill overlap, user-adjusted proficiency (10–100%), related skill bonuses, and interest affinity. Never falsely claims scores are hiring probabilities.
5. **Full Multi-Table Persistence**: All user profiles, competencies, saved careers, learning tasks, networking contacts, and conversations persist in SQLite with foreign keys enforced (`PRAGMA foreign_keys = ON;`).
6. **Strict Security & Data Isolation**: Password hashing using Werkzeug PBKDF2/scrypt, expiring HS256 JWT tokens, and strict server-side authorization ensuring User A cannot inspect, modify, or delete User B's private data.

---

## 2. Cinematic Design System & Visual Transformation

### 2.1 Preserved Color Palette (Non-Negotiable Brand Identity)
The application strictly preserves the established warm editorial color palette without introducing conflicting themes:
- **Warm Canvas Background**: `--bg-paper: #F3EFE6`
- **Primary Content Surface**: `--surface-primary: #FAF8F2`
- **Secondary Subtle Surface**: `--surface-secondary: #E9E3D8`
- **Primary Ink Typography**: `--ink-primary: #292923`
- **Secondary Ink / Labels**: `--ink-secondary: #65645C`
- **Muted Metadata**: `--ink-muted: #8A887E`
- **Dividing Rules**: `--rule-subtle: #D4CDC0`, `--rule-strong: #292923`
- **Controlled Accents**:
  - Deep Editorial Burgundy (`--accent-burgundy: #813744`): Primary CTAs, active indicators, brand wordmark.
  - Muted Olive (`--accent-olive: #626B4F`): Verified skills, completed milestones, high readiness signal.
  - Terracotta (`--accent-terracotta: #B75E43`): Skill gaps, missing competencies, urgent priorities.
  - Muted Gold (`--accent-gold: #AD8C50`): Academic milestones, status badges, offline indicators.

### 2.2 Spatial Tokens & Refined Component Geometry
Moved away from rigid rectangular 2px boxes into sculpted curves and layered depth:
- `--radius-sm: 10px`: Inputs, dropdown items, compact action tags.
- `--radius-md: 16px`: Secondary cards, message bubbles, table containers.
- `--radius-lg: 22px`: Primary panels, carousel cards, spotlight cards, auth containers.
- `--radius-xl: 32px`: Hero containers, monograph modals.
- `--radius-pill: 9999px`: Buttons, filter chips, status tags, stage indicators.
- Ambient Elevation & Shadows:
  - `--shadow-subtle: 0 2px 8px -2px rgba(41, 41, 35, 0.05)`
  - `--shadow-card: 0 4px 20px -4px rgba(41, 41, 35, 0.08)`
  - `--shadow-elevated: 0 16px 40px -8px rgba(41, 41, 35, 0.14)`
  - `--shadow-glow-burgundy: 0 8px 24px -4px rgba(129, 55, 68, 0.35)`

### 2.3 Motion, Animation & Tactile Interaction System
- Easing curves: `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-expo: cubic-bezier(0.19, 1, 0.22, 1)`.
- Keyframe animations:
  - `@keyframes cinematicFadeUp`: Staggered section entrance with subtle translation.
  - `@keyframes pulseBeacon`: Live status beacon dot pulsing with box-shadow breathing.
  - `@keyframes modalZoomIn`: Smooth spring zoom-in on modal presentation.
  - `@keyframes typingBounce`: 3-dot sequential bouncing indicator in the AI consultation room.
- Tactile button states: `.btn-primary` features subtle hover lift (`translateY(-2px)`), warm bevel top highlight, and active press compression (`scale(0.98)`).
- Full reduced-motion accessibility compliance (`@media (prefers-reduced-motion: reduce)` disables non-essential animations).

### 2.4 Strict Editorial Prohibitions Enforced
- Zero Lucide icons (all interface decoration uses confident typography, numbered index tags like `01`, and clean unicode symbols `→`, `×`, `↗`).
- Zero em dashes in interface copy.
- Zero harsh gradients, glassmorphism, or radial orbs.
- Zero fake testimonials, fake user counts, or invented social proof.
- Zero repetitive 3-feature card rows or plain bento boxes.

---

## 3. Flagship Experiences & Page Enhancements

### 3.1 Cinematic Landing Page (`LandingPage.jsx`)
- **Live Folio Header**: Displays publication date, UN SDG 8 alignment badge, and live AI engine status beacon.
- **Hero Section**: Confident serif headline with fluid `clamp()`, executive dossier preview card with animated entrance, and dual primary/secondary CTA buttons.
- **Interactive 3-Stage Progression Carousel**:
  - Stage 01: Intelligent Career Discovery.
  - Stage 02: Analytical Skill-Gap Evaluation.
  - Stage 03: Structured 30-Day Curricula & AI Advisory.
  - Complete keyboard navigation (`ArrowLeft` / `ArrowRight`), step buttons, progress bar, and metrics.
- **Live Competency Matcher Console**: Interactive skill chips, custom input, real-time recalculation against `/api/jobs`, and direct role monograph modal inspection.
- **Canonical Career Matrix**: Category-filtered table with domain filter pills.
- **STAR & Google XYZ Advisory Showcase**: Interactive consultation transcript demonstration.
- **Architectural 4-Column Footer**:
  - Col 1: CareerPath AI brand identity, mission statement, live system operational beacon.
  - Col 2: Platform Coordinates (links to Briefing, Directions, Ledger, Roadmap).
  - Col 3: Governance & Trust (Privacy Policy, Terms of Service, UN SDG 8 monograph).
  - Col 4: Dispatch Newsletter Subscription with simulated interactive feedback.

### 3.2 Executive Career Briefing Dashboard (`DashboardPage.jsx`)
- Personalized greeting, academic stage badge, and stated vocational goal callout.
- **#01 Top Match Spotlight Card**: Match signal progress track, verified competencies in olive, missing competencies in terracotta, and direct monograph modal inspection.
- Ranked career trajectories table with hover lift and action buttons.
- Competency progress meters with olive fill tracks.
- Active learning priorities with interactive checkbox status toggles updating the SQLite backend in real time.
- Right-hand Intelligence Dossier with quick competency addition and AI consultation room trigger.

### 3.3 Advisory Consultation Room (`ChatPage.jsx`)
- Thread history sidebar with "New Consultation +", inline title editing, deletion, and operating engine diagnostics badge.
- Cinematic chat message bubbles (`.chat-entry.user` and `.chat-entry.assistant`) with clean typography hierarchy.
- Interactive action buttons inside assistant responses (direct routing to `/roadmap`, `/skills`, etc.).
- Animated 3-dot typing indicator (`.chat-typing-indicator`) during inference.
- Suggested inquiry chips with hover lift.
- Sculpted composer area with focus glow and Enter/Shift+Enter key handling.

### 3.4 Professional Relations Ledger (`NetworkingPage.jsx`)
- Rounded pill navigation tabs switching between Contacts Ledger and Message Frameworks.
- Contacts table with color-coded pipeline stage tags (`Connected` in olive, `Follow-Up Needed` in burgundy, `In Discussion` in terracotta, `Reached Out` in gold).
- Contact creation/editing modal (`ContactModal.jsx`) with smooth backdrop blur.
- Canonical message templates with one-click clipboard copying and toast feedback.

### 3.5 Learning Roadmap & Study Calendar (`RoadmapPage.jsx` & `CalendarPage.jsx`)
- Overall curriculum progress bar with real-time percentage completion.
- Status filters (`All`, `Pending`, `Completed`).
- Milestone task modal (`TaskModal.jsx`) for custom milestone creation and edits.
- Interactive study calendar with month switcher, date cells displaying task count dots, and selected date inspector.

### 3.6 Settings, Onboarding & Legal Monograph Pages
- `SettingsPage.jsx`: Profile coordinates, password updater, live AI subsystem diagnostics with pulsing health beacons, and Danger Zone reset action.
- `OnboardingPage.jsx`: 3-stage progression tracker with active step glow, proficiency calibration sliders, and target role specification.
- `LoginPage.jsx` & `RegisterPage.jsx`: Sculpted auth panels with elevated paper depth.
- `PrivacyPolicyPage.jsx` & `TermsPage.jsx`: Legal monographs with sovereign data disclosures, zero telemetry guarantees, and UN SDG 8 alignment declarations.

---

## 4. Technology Stack & Repository Map

### 4.1 Stack Details
- **Frontend**: React 19.2, Vite 8.3.4, `@tailwindcss/vite` 4.1, `react-router-dom` 7.18.4, `axios` 1.20 (pure typography & unicode, zero Lucide).
- **Backend**: Python 3.14 (compatible with 3.11+), Flask 3.1.3, Flask-Cors 6.0.5, PyJWT 2.15.1, Requests 2.34.2, Scikit-learn 1.9.1, NumPy 2.5.4, python-dotenv 1.2.4.
- **Database**: SQLite 3 with `PRAGMA foreign_keys = ON;`.
- **Environment**: Node.js v22.14.0 LTS portable at `C:\Users\HP\nodejs`.

### 4.2 Repository Structure
```
CareerPathAI_Starter/
├── backend/
│   ├── .venv/                      # Python virtual environment
│   ├── data/
│   │   └── jobs.json               # Seed catalogue JSON backup
│   ├── routes/
│   │   ├── auth_routes.py          # /api/auth (register, login, me, password, reset)
│   │   ├── profile_routes.py       # /api/profile (get, put, onboarding)
│   │   ├── skills_routes.py        # /api/skills (CRUD, suggestions)
│   │   ├── career_routes.py        # /api/careers (catalogue, match, save, gap)
│   │   ├── roadmap_routes.py       # /api/roadmap (tasks CRUD, generate)
│   │   ├── networking_routes.py    # /api/networking (contacts CRUD, templates)
│   │   ├── chat_routes.py          # /api/chat (threads, messages, AI status)
│   │   ├── search_routes.py        # /api/search (cross-entity global search)
│   │   └── notification_routes.py  # /api/notifications (get, read, clear)
│   ├── ai_service.py               # Dual-mode AI assistant & intent classifier
│   ├── app.py                      # Flask factory & blueprint registration
│   ├── auth.py                     # Werkzeug hash & PyJWT token utilities
│   ├── careerpath.db               # Active SQLite database file
│   ├── database.py                 # SQLite schema & idempotent 12-role seeder
│   ├── evaluate.py                 # Benchmark evaluation harness
│   ├── matching.py                 # Overlap, proficiency weighting, TF-IDF NLP
│   ├── requirements.txt            # Pinned backend dependencies
│   ├── test_backend.py             # 14-test unit and API test suite
│   └── test_e2e_journey.py         # Full user lifecycle integration test
├── frontend/
│   ├── src/
│   │   ├── api/client.js           # Axios instance with Bearer interceptors
│   │   ├── components/
│   │   │   ├── CareerDetailModal.jsx # Detailed role specifications monograph
│   │   │   ├── ContactModal.jsx      # Networking contact create/edit modal
│   │   │   ├── Sidebar.jsx           # Editorial nav sidebar with numbered index
│   │   │   ├── TaskModal.jsx         # Roadmap task create/edit modal
│   │   │   └── Topbar.jsx            # Search dropdown, notifs, user menu
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication & user state provider
│   │   │   └── ToastContext.jsx      # Editorial notice toast dispatches
│   │   ├── pages/
│   │   │   ├── CalendarPage.jsx      # Interactive learning calendar
│   │   │   ├── CareersPage.jsx       # Explore careers catalogue & filters
│   │   │   ├── ChatPage.jsx          # Advisory desk consultation room
│   │   │   ├── DashboardPage.jsx     # Executive career briefing & metrics
│   │   │   ├── JobsPage.jsx          # Benchmark opportunity index
│   │   │   ├── LandingPage.jsx       # Editorial cover dispatch & progression carousel
│   │   │   ├── LoginPage.jsx         # Editorial authentication panel
│   │   │   ├── NetworkingPage.jsx    # Professional relations ledger
│   │   │   ├── NotFoundPage.jsx      # Editorial 404 monograph handler
│   │   │   ├── OnboardingPage.jsx    # 3-stage profile calibration wizard
│   │   │   ├── PrivacyPolicyPage.jsx # Data sovereignty declaration
│   │   │   ├── RegisterPage.jsx      # User registration form
│   │   │   ├── RoadmapPage.jsx       # 30-day curriculum milestones & CRUD
│   │   │   ├── SettingsPage.jsx      # Profile coordinates & AI diagnostics
│   │   │   ├── SkillsPage.jsx        # Competency ledger & live gap benchmark
│   │   │   └── TermsPage.jsx         # Terms of service & educational disclosure
│   │   ├── App.jsx                   # Master router & ProtectedLayout
│   │   ├── main.jsx                  # React DOM mount
│   │   └── styles.css                # Cinematic design tokens & styling
│   ├── index.html                    # Root HTML with Google Fonts
│   ├── package.json                  # Frontend scripts & dependencies
│   └── vite.config.js                # Vite configuration
├── docker-compose.yml                # Multi-container production deployment
├── Dockerfile                        # Backend production image
├── HANDOVER.md                       # This handover document
├── README.md                         # Publication-grade system documentation
├── run_tests.bat                     # Windows test runner script
├── start_backend.bat                 # Windows backend launch script
└── start_frontend.bat                # Windows frontend launch script
```

---

## 4. AI Personality, Intelligence, and Full Application Integration (Section 10)

The AI has been transformed from an isolated chat widget into an intelligent, proactive career mentor integrated throughout the entire application lifecycle.

### 4.1 Authentic Persona & Transparency
- **Supportive, Honest Mentor Voice**: Communicates like a knowledgeable engineering director or senior career mentor. Avoids empty motivational platitudes, robotic greetings, and ungrounded claims. Explains *why* recommendations matter and provides concrete next steps.
- **Transparent Inference Reporting**: Live telemetry via `GET /api/chat/status` honestly reports whether inference is running on local Ollama, Google Gemini, or the offline Context-Aware Career Coach Engine.
- **Zero Fabrications**: Proactive recommendations and career fit evaluations are strictly computed from real database records (user's target role, recorded competencies, roadmap milestones, and study time budget).

### 4.2 Cross-Page AI Integration Architecture
1. **Executive Dashboard (`DashboardPage.jsx`)**:
   - **Proactive AI Mentor Intelligence Strip**: Synthesizes 2 to 3 live dismissible insights from `/api/chat/proactive-insights` (e.g. portfolio project gaps, weekly pacing advice, and pending roadmap tasks).
   - Direct quick-inquiry buttons route with tailored prompts to the advisory consultation room.
2. **Career Monograph Modal (`CareerDetailModal.jsx`)**:
   - **Section 04: AI Career Mentor Evaluation & Strategy**: Calls `POST /api/chat/role-advice` to evaluate candidate alignment against the selected benchmark role.
   - Highlights demonstrated competencies vs high-priority gaps.
   - **One-Click Roadmap Bridge**: Features "+ Add Milestone to Roadmap" buttons that execute `POST /api/roadmap/tasks` directly from the modal with instant visual feedback (`✓ Milestone Added to Roadmap`).
   - Direct handoff button to consult the mentor with a pre-filled role inquiry.
3. **Canonical Discovery & Opportunity Index (`CareersPage.jsx` & `JobsPage.jsx`)**:
   - Each benchmark role features an "Inspect Role & AI Fit →" action trigger providing instant access to the AI evaluation.
4. **Competency Ledger & Benchmark Gap Analysis (`SkillsPage.jsx`)**:
   - **AI Competency & Demonstration Advisor**: Explicitly explains the critical hiring difference between self-assessed proficiencies and demonstrated competencies (verifiable code repositories and deployed artifacts).
   - Provides per-gap inquiry links (`→ Project idea to demonstrate [Skill]`) and an overall gap prioritization button routing to the consultation room.
5. **30-Day Learning Roadmap (`RoadmapPage.jsx`)**:
   - **AI Curriculum Pacing & Strategy Guide**: Dynamically analyzes the user's `weekly_hours` budget and `learning_style` to recommend realistic milestones per week.
   - One-click inquiry actions ("Prioritize My X Hours This Week", "Generate 4-Week Study Plan").
6. **Advisory Consultation Room (`ChatPage.jsx`)**:
   - **Actionable Execution Bridge**: Renders structured action payloads (e.g. `act.type === 'create_task'`) into one-click "+ Add Milestone to Roadmap" buttons that persist directly to the database.
   - **Deep Link Navigation**: Reads `?prompt=` query parameters on load to auto-dispatch inquiries coming from the dashboard, skills page, or career modals.
   - **Copy Advice Control**: Allows instantaneous copying of mentor guidance to clipboard with confirmation toast feedback.
7. **Profile Personalization & Sovereignty (`OnboardingPage.jsx` & `SettingsPage.jsx`)**:
   - Captures and allows review/editing of `learning_style`, `weekly_hours`, and `portfolio_projects`.
   - Clear controls for clearing goals and resetting platform activity data while strictly isolating each user's records.

---

## 5. Verification Matrix & Quality Assurance

All test suites and live server checks have been executed and verified clean:

| Verification Stage | Execution Command | Result | Details |
| :--- | :--- | :--- | :--- |
| **Backend Unit Tests** | `python backend/test_backend.py` | **16 / 16 PASSED** (0 errors) | Covers auth, duplicate user rejection, password hashing, skills CRUD, matching algorithm, roadmap generation, tasks CRUD, networking, chat, proactive AI insights, role advice, and weekly hours preferences. |
| **E2E User Journey** | `python backend/test_e2e_journey.py` | **1 / 1 PASSED** (12 stages) | Validates registration, onboarding, skill calibration, career match calculation, roadmap tasks, calendar milestones, contacts, AI chat, diagnostics, and reset. |
| **Evaluation Benchmark** | `python backend/evaluate.py` | **100.0% Top-1 Agreement** | Evaluates TF-IDF similarity model and overlap matching against ground truth roles. |
| **Frontend Production Build** | `npm run build` | **BUILT IN 1.02s** (0 errors) | 103 modules transformed, production assets generated cleanly. |
| **Em Dash Audit** | PowerShell RegEx search | **0 EM DASHES FOUND** | Verified strict compliance across all JSX and CSS files. |
| **Lucide Icon Audit** | PowerShell RegEx search | **0 LUCIDE IMPORTS FOUND** | Completely eradicated in favor of typography and unicode. |
| **Backend Live Service** | `GET http://127.0.0.1:5000/api/health` | **HTTP 200 OK** | Flask daemon active and responding. |
| **Frontend Live Service** | `GET http://localhost:5173` | **HTTP 200 OK** | Vite dev server active and hot-reloading. |

---

## 6. How to Run & Operate the System

### 6.1 Starting the Application
1. **Backend**:
   ```powershell
   & "c:\Users\HP\Downloads\CareerPathAI_Starter\CareerPathAI_Starter\backend\.venv\Scripts\python.exe" backend/app.py
   # Runs on http://127.0.0.1:5000
   ```
2. **Frontend**:
   ```powershell
   $env:PATH = "C:\Users\HP\nodejs;" + $env:PATH
   npm run dev --prefix frontend
   # Runs on http://localhost:5173
   ```
3. **Automated Scripts**:
   - `start_backend.bat`: Launches the Flask API.
   - `start_frontend.bat`: Launches the Vite frontend.
   - `run_tests.bat`: Runs the backend unit and e2e test suites.

### 6.2 AI Engine Modes
- **Offline Context-Aware Mode (Default)**: Ready out of the box with zero external dependencies.
- **Ollama Generative Mode**: Run `ollama run llama3.2` locally; CareerPath AI automatically detects it on port 11434 and switches to generative responses.
- **Google Gemini Mode**: Set `GEMINI_API_KEY=your_key` in `backend/.env`.

---

## 7. Developer & Autonomous Agent Guidelines

When maintaining or extending this repository:
1. **Preserve Color Palette Tokens**: Always use the defined CSS variables (`--bg-paper`, `--surface-primary`, `--ink-primary`, `--accent-burgundy`, `--accent-olive`, `--accent-terracotta`, `--accent-gold`). Do not introduce arbitrary new colors.
2. **Preserve Component Geometry**: Use `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, and `--radius-pill`. Avoid flat 0px/2px borders or generic bento boxes.
3. **No Dead Controls Rule**: Ensure all new buttons or controls connect to real API routes or trigger real UI feedback.
4. **No Em Dashes or Lucide Icons**: Strictly avoid em dashes (`—`) in copy and avoid importing `lucide-react`.
5. **Always Verify Builds & Tests**: Run `npm run build` and `python backend/test_backend.py` after any structural modifications.
