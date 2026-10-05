# CYBERNEXUS Lab Network Isolation Model

## Security Boundaries
```
[ HOST MACHINE & PUBLIC INTERNET ]
               │
               ▼ (Controlled API Boundary)
    [ CYBERNEXUS BACKEND & UI ]
               │
               ▼ (Internal Private Bridge: cybernexus_lab_net)
 ┌─────────────────────────────────────────────────────────────┐
 │                      ISOLATED LAB SUBNET                    │
 │                        10.240.0.0/16                        │
 │                                                             │
 │  ┌──────────────┐   ┌──────────────┐   ┌─────────────────┐  │
 │  │    WEB-01    │───│    API-01    │───│      DB-01      │  │
 │  │ 10.240.0.10  │   │ 10.240.0.11  │   │   10.240.0.12   │  │
 │  └──────────────┘   └──────────────┘   └─────────────────┘  │
 │         │                                       │           │
 │  ┌──────────────┐                      ┌─────────────────┐  │
 │  │   LINUX-01   │                      │  CONTAINER-01   │  │
 │  │ 10.240.0.23  │                      │   10.240.0.30   │  │
 │  └──────────────┘                      └─────────────────┘  │
 └─────────────────────────────────────────────────────────────┘
```

## Network Security Principles
1. **Isolated Private Bridge**: All lab containers communicate over `cybernexus_lab_net` (`10.240.0.0/16`).
2. **Zero Unrestricted Port Exposure**: Target lab ports (such as PostgreSQL 5432 or SSH 22) are bound strictly inside the internal Docker network and are **never** mapped directly to `0.0.0.0` or public host interfaces.
3. **Controlled Gateway Routing**: Traffic to/from target lab assets is inspected by the CYBERNEXUS telemetry agent.
