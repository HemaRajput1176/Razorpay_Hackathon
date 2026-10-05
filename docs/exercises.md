# CYBERNEXUS Security Exercise Pipeline & Architecture Guide

## Overview
Milestone 3 implements the first end-to-end, genuinely functional security validation pipeline (`EX-001: NEXORA WEB SECURITY VALIDATION`) inside the isolated CYBERNEXUS Cyber Range.

## End-to-End Pipeline Stages
1. **Pre-Flight Validation**: Verifies 10 security preconditions (`[✓] User Auth`, `[✓] Lab Running`, `[✓] Target WEB-01 Isolated`, etc.).
2. **Authorized Scope Banner**: Enforces local Cyber Range target scope (`WEB-01`, `API-01`, `DB-01`).
3. **Controlled Scenario Execution (`SCN-WEB-001`)**: Issues synthetic security request to target `WEB-01` with request correlation ID (`EX001-7F92...`).
4. **Telemetry Capture & Normalization**: Captures and normalizes 3 events (`WEB-01`, `API-01`, `DB-01`).
5. **Detection Rule Evaluation (`RUL-WEB-001`)**: Evaluates event conditions against active SIEM rules.
6. **SIEM Alert Generation (`ALRT-EX001`)**: Generates alert with `94.7%` confidence rating and `HIGH` severity.
7. **Incident Creation (`INC-EX001`)**: Opens incident assigned to `analyst01`.
8. **SHA-256 Forensic Evidence Linking**: Links 3 log artifacts with SHA-256 hashes (`VERIFIED` integrity).
9. **Risk Scoring & MITRE ATT&CK Mapping**: Computes composite risk score (`82 / 100`) and maps to MITRE ATT&CK (`T1190: Exploit Public-Facing Application`).
10. **Finding & Remediation Guide (`FND-WEB-001`)**: Provides clear remediation steps.
11. **Fix → Re-Test Validation**: Executes re-test, updates Finding status to `VERIFIED`, and drops Risk Score from `82` to `18`.
12. **Executive Assessment PDF Report Export**: Generates evidence-backed assessment report.
