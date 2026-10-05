# CYBERNEXUS — AI-Powered Autonomous Cyber Defense & Security Validation Platform

> **TAGLINE**: ATTACK. DETECT. INVESTIGATE. RESPOND. VALIDATE.

CYBERNEXUS is an enterprise-grade, portfolio-level cybersecurity platform designed for high-density operational control centers, threat operations, cyber range labs, and AI-driven defense validation.

---

## 🛡️ Key Platform Capability Pillars

1. **Command Center**: Real-time operational security posture (87/100), active telemetry stream, threat distribution, and active incident queue.
2. **SOC Operations**: Correlated SIEM/EDR alert stream, MTTD/MTTR analytics, and detailed incident drawers with MITRE ATT&CK mapping.
3. **Controlled Cyber Terminal**: Monospace hacker-style terminal executing safe backend administrative and telemetry queries (`system.status`, `range.status`, `assets.list`, `incidents.list`, `threats.summary`, `ai.status`, `help`).
4. **Authorized Security Model**: Enforces strict authorized testing against owned lab assets (Cyber Range) and customer approved targets. Zero unauthorized scanning logic.
5. **NEXUS AI Security Brain**: Multi-agent threat reasoning, confidence scoring, and structured evidence correlation.

---

## 🎨 Visual Identity & UI Command Center

- Inspired by NASA mission control + elite SOC + hacker terminal + futuristic AI command center.
- Controlled dark cyber palette: `#030609` (primary bg), `#070B11` (panel), `#00E5FF` (cyan primary), `#22C55E` (green success / ACCESS GRANTED), `#8B5CF6` (AI purple).
- JetBrains Mono technical typography, glowing thin borders, CRT scanlines, keyboard command palette (`Ctrl + K`).

---

## 🚀 Quick Start Guide

### 1. Frontend Setup (React + TypeScript + Vite + Tailwind CSS)

```bash
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:3000`.

### 2. Backend Setup (FastAPI + SQLAlchemy + SQLite/PostgreSQL)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The backend REST API starts at `http://localhost:8000`. API Swagger Docs available at `http://localhost:8000/docs`.

---

## 🧪 Testing & Verification

- **Frontend Type Check**: `npm run build` inside `frontend/`
- **Backend Import & Syntax Check**: `python -m py_compile app/main.py` inside `backend/`

---

## 📁 Repository Structure

```
cybersecurity/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI Routers (health, auth, dashboard, soc, terminal)
│   │   ├── config/       # Settings & environment variables
│   │   ├── database/     # SQLAlchemy engine & session maker
│   │   ├── models/       # ORM schemas (Users, Assets, Incidents, Alerts, AuditLogs)
│   │   └── main.py       # FastAPI application & startup seed data loader
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Common cards, logo, badge, command palette, terminal, boot sequence
│   │   ├── pages/        # Command Center, SOC Dashboard, Generic Module Placeholder
│   │   ├── services/     # API service abstraction
│   │   ├── types/        # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── index.css     # Cyber design system & scanlines CSS
│   ├── package.json
│   └── vite.config.ts
├── docs/                 # Architecture, Security Model & UI documentation
└── README.md
```
