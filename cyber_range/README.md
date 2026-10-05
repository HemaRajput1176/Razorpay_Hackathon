# CYBERNEXUS — Isolated Cyber Range Laboratory

## Overview
The CYBERNEXUS Cyber Range provides an isolated, local security laboratory environment powered by Docker Compose and the CYBERNEXUS Backend Lab Manager.

## Lab Architecture: NEXORA ENTERPRISE LAB
- **Subnet**: `10.240.0.0/16` (Isolated Docker Bridge: `cybernexus_lab_net`)
- **Assets**:
  - `WEB-01` (`10.240.0.10`): Nginx Web Server / Application Gateway
  - `API-01` (`10.240.0.11`): Node.js RESTful API Microservice
  - `DB-01` (`10.240.0.12`): PostgreSQL 16 Isolated Database Server
  - `LINUX-01` (`10.240.0.23`): Internal Linux Workstation
  - `CONTAINER-01` (`10.240.0.30`): Container Microservice Worker

## Security Controls
1. **Network Isolation**: Dedicated private Docker bridge network (`cybernexus_lab_net`).
2. **Resource Limits**: Configurable CPU (max 2.0 cores) and Memory (max 2048 MB) limits.
3. **No Unrestricted Egress/Ingress**: Vulnerable target ports are never exposed to the public internet or 0.0.0.0.
4. **No Host Filesystem Mounts**: Host mounts and Docker socket mounts into target containers are strictly forbidden.
