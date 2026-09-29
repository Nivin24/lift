# LIFT — Learning, Implementation & Focus Tracker
### The Personal Command Center for Brototype Boarding Modules & TOI Preparation

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Expo](https://img.shields.io/badge/Expo-52.0.0-000020.svg?logo=expo&logoColor=white)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## What is LIFT?

**LIFT** is a full-stack personal learning, implementation, and revision command center specifically built for **Brototype students** who have completed their rigorous academy course syllabuses and are now navigating the high-stakes **Boarding Modules (BM1 & BM2)** and **TOI (Take Off Interview)** phases.

Whether completing a 7-month fast-track or a comprehensive 1-year journey, the Boarding Modules represent the most intense weeks of the curriculum:
- **BM1 (Boarding Module 1)**: Core foundation mastery, deep-dive programming concepts, synchronous/asynchronous runtimes, memory models, algorithms, and technical workouts.
- **BM2 (Boarding Module 2)**: Scalable backend architectures, distributed messaging queues, microservices, containerization, and end-to-end system design.
- **TOI (Take Off Interview)**: Mock technical interviews, machine tasks, domain defense, and real-world engineering readiness.

---

## The Problem LIFT Solves

During the Boarding Modules, students must revise, practice, and prove mastery over concepts learned across **28 to 52 demanding weeks**—all within a matter of days. 

- **Cognitive Overload**: Trying to organize hundreds of topics, subtopics, machine tasks, and interview questions across physical books, loose paper sheets, or scattered text files leads to lost focus and missed revision gaps.
- **Lack of True Visibility**: Without a structured tracker, it is difficult to know exactly how much of BM1 is mastered before stepping into BM2, or whether machine-task prerequisites have been thoroughly practiced.
- **Scattered Resources**: Practice problems, authoritative solutions, personal syntax gotchas, and interview cheat sheets end up fragmented across multiple tools.

**LIFT centralizes the entire preparation journey into a single, distraction-free digital workspace.**

---

## Key Features

### 1. Strict Multi-Stage Progression Engine
- Progression follows a strict gate: **BM1 (100% Required) ➔ BM2 (100% Required) ➔ TOI**.
- Gating is enforced on **both the backend (FastAPI HTTP 403 checks)** and the **frontend UI** (locked badges, progression track, and unlock gate validations).

### 2. Comprehensive Topic & Syllabus Workspace
- **14-Section Deep-Dive Curriculum**: Every topic includes learning objectives, expected outcomes, prerequisites, and a three-dimension relevance breakdown (*Machine-Task*, *Practical-Task*, and *Interview/TOI*).
- **Interactive Syllabus Checklist**: Official syllabus items with instant check-off state persisted per user.
- **Questions & Quizzes**: Multiple-choice quizzes and conceptual interview questions with expandable authoritative solutions.
- **Hands-on Workouts & Tasks**: Task management cards with status trackers (`TODO`, `IN PROGRESS`, `COMPLETED`), priority pills, and dedicated workout instructions.
- **Integrated Personal Notes**: Monospaced study markdown scratchpad per topic, saved directly to the database.

### 3. Smart Task & Practice Filtering
- Filter workouts by module code (`BM1`, `BM2`, `TOI`), task type, priority, and real-time status pills.
- Instant search by title or description with one-click filter resets.
- Zero raw operating system dropdowns—built with responsive floating popover selectors.

### 4. Distraction-Free Developer Workspace UI
- Detached floating island layout with clean hairline borders (`#E3E5DE` / `#262A27`).
- Seamless **Dark & Light Mode** matching modern code editors and developer tools.
- Top bar with global Spotlight Search (`⌘K`), instant theme toggle, and multi-user switching.
- Standardized container width (`max-w-7xl mx-auto`) for flawless desktop and laptop immersion.

### 5. AI Curriculum Assistant (Gemini BYOK)
- Bring-Your-Own-Key (BYOK) architecture with **Fernet (AES-GCM/HMAC) encryption at rest**.
- Generates supplemental study materials, practice problems, and machine workouts on demand with a strict review-before-saving preview modal.

---

## Future Roadmap: What's Coming in Next Versions

- [ ] **RAG (Retrieval-Augmented Generation) Knowledge Base**: Ingest official documentation, academy notes, and common interview questions into a local vector database.
- [ ] **AI Weakness Diagnostics & Study Coach**: Analyze student quiz scores, task completion speed, and stuck items to highlight topics that need immediate re-revision before the TOI interview.
- [ ] **Timed Mock Machine Tasks**: Automated countdown timer with test harness runners to simulate real interview pressure.
- [ ] **Study Partner Sync**: Pair programming review sessions and progress comparisons between peers.

---

## Project Structure

```
LIFT/
├── backend/                  # FastAPI + SQLAlchemy + PostgreSQL / SQLite backend
│   ├── app/
│   │   ├── api/v1/           # API routes (auth, modules, areas, topics, tasks, progress, ai)
│   │   ├── core/             # Configuration, database session, encryption
│   │   ├── models/           # Relational entities (User, Topic, Task, Progress, Material)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # ProgressionEngine, AIService, EncryptionService
│   │   └── seed/             # Real BM1/BM2 curriculum data seeders
│   └── tests/                # Automated pytest test suites
│
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS (Web Workspace)
│   ├── src/
│   │   ├── components/       # Header, Sidebar, CardStatusDropdown, StudyMaterialViewer, AI Modal
│   │   ├── context/          # ThemeContext (dark/light) & AuthContext
│   │   ├── pages/            # Dashboard, TopicView, LearningAreaView, TasksView, AnalyticsView
│   │   └── services/         # Axios API client
│
├── mobile/                   # React Native + Expo (Cross-Platform Mobile App)
│   ├── app/                  # Expo Router screens & navigation
│   └── src/                  # Mobile components, hooks, and API integrations
│
└── docs/                     # Deep-dive architecture specs & PRDs (see docs/ folder)
```

> **Note for Deep Dive**: For complete technical specifications, database schema diagrams, and architecture decisions, refer to the documentation inside the [`docs/`](docs/) directory.

---

## Quickstart Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL (or uses SQLite fallback for development)

---

### 2. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Healthcheck Endpoint**: `http://localhost:8000/health`

---

### 3. Frontend Web Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- **Web App**: `http://localhost:5173/`

---

### 4. Running Backend Tests

```bash
cd backend
PYTHONPATH=. .venv/bin/pytest -v
```

---

### 5. Mobile App Setup (React Native + Expo)

```bash
cd mobile

# Install dependencies
npm install

# Start Expo dev server
npx expo start -c
```
- Scan QR code via **Expo Go** on Android/iOS or press `a` for Android Emulator / `i` for iOS Simulator.

---

## License

Personal and Educational Use for Brototype / Academy Students. All rights reserved.
