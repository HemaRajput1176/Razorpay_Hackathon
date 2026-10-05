# CYBERNEXUS Cyber Range Architecture & User Guide

## Overview
The CYBERNEXUS Cyber Range is an isolated, local security laboratory environment designed for security education, authorized vulnerability research, defensive validation, and controlled red/blue/purple team exercises.

## Core Components
1. **Lab Definition (`lab.yaml`)**: Declarative specification defining target assets, IP allocation (`10.240.0.0/16`), container names, operating systems, roles, and microservices.
2. **Docker Compose Engine (`docker-compose.cyber-range.yml`)**: Configures 5 isolated lab targets (`WEB-01`, `API-01`, `DB-01`, `LINUX-01`, `CONTAINER-01`) attached to private bridge network `cybernexus_lab_net`.
3. **Backend Docker Manager (`app/labs/docker_manager.py`)**: Interacts with Docker CLI / Docker Compose, inspects daemon availability, enforces memory/CPU quotas, and handles diagnostic fallback when Docker is offline.
4. **Lab Service (`app/labs/service.py`)**: Manages the lab state machine (`CREATED` -> `STARTING` -> `RUNNING` -> `STOPPING` -> `STOPPED` -> `ERROR`), handles database persistence, records immutable audit logs, and emits WebSocket event streams.
5. **Interactive UI (`CyberRangePage.tsx`)**: Provides top status telemetry, lab start/stop/restart control actions, interactive node topology graph (`LabTopology.tsx`), asset drawer telemetry (`AssetDetailDrawer.tsx`), live WebSocket event panel, and controlled cyber terminal.
