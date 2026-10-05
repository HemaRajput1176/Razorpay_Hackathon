# CYBERNEXUS Architecture Overview

## Overview
CYBERNEXUS is designed as a decoupled, multi-tier autonomous cyber defense and validation platform.

## Architecture Layers
1. **Frontend Presentation Tier**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion. Provides a Command Center UI, SOC dashboard, terminal component, and global keyboard shortcuts.
2. **REST & Telemetry API Tier**: Python FastAPI backend with Pydantic validation, CORS middleware, structured error handlers, and JWT authentication foundations.
3. **Data & Persistence Tier**: SQLAlchemy ORM backing SQLite for zero-dependency local testing and PostgreSQL for production deployments.
4. **Controlled Command Engine**: Controlled command registry preventing arbitrary shell injection while facilitating backend administrative queries (`system.status`, `range.status`, `assets.list`, `incidents.list`, `threats.summary`, `ai.status`, `help`).
