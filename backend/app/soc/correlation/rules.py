import json
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.schemas import CorrelationRule

DEFAULT_CORRELATION_RULES = [
    {
        "rule_code": "CORR-AUTH-001",
        "name": "Repeated Failed Authentication Attempts Threshold",
        "description": "Detects >= 5 failed authentication attempts against the same asset within 60 seconds (Brute-Force Pattern).",
        "rule_type": "THRESHOLD",
        "severity": "HIGH",
        "window_seconds": 60,
        "threshold": 5,
        "conditions_json": json.dumps({"event_type": "AUTH_FAILURE"}),
        "technique_id": "T1110"
    },
    {
        "rule_code": "CORR-AUTH-002",
        "name": "Authentication Failure Burst Followed by Successful Login",
        "description": "Detects multiple failed logins immediately followed by a successful login from the same source IP.",
        "rule_type": "SEQUENCE",
        "severity": "HIGH",
        "window_seconds": 120,
        "threshold": 3,
        "conditions_json": json.dumps({"sequence": ["AUTH_FAILURE", "AUTH_SUCCESS"]}),
        "technique_id": "T1078"
    },
    {
        "rule_code": "CORR-PRIV-001",
        "name": "Suspicious Privileged Action Following Authentication",
        "description": "Detects sensitive administrative configuration change or key export immediately after authentication.",
        "rule_type": "SEQUENCE",
        "severity": "CRITICAL",
        "window_seconds": 180,
        "threshold": 2,
        "conditions_json": json.dumps({"sequence": ["AUTH_SUCCESS", "PRIVILEGED_ACTION"]}),
        "technique_id": "T1068"
    },
    {
        "rule_code": "CORR-NET-001",
        "name": "Unexpected Service Access / Connection Burst",
        "description": "Detects high-frequency unexpected network connection requests to unmapped internal service ports.",
        "rule_type": "THRESHOLD",
        "severity": "MEDIUM",
        "window_seconds": 30,
        "threshold": 10,
        "conditions_json": json.dumps({"event_type": "NETWORK"}),
        "technique_id": "T1046"
    },
    {
        "rule_code": "CORR-API-001",
        "name": "Abnormal API Request Volume & Authorization Failures",
        "description": "Detects repeated 401/403 authorization failures on sensitive API endpoints.",
        "rule_type": "MULTI_EVENT",
        "severity": "HIGH",
        "window_seconds": 60,
        "threshold": 4,
        "conditions_json": json.dumps({"event_type": "API", "result": "AUTHORIZATION_FAILURE"}),
        "technique_id": "T1190"
    },
    {
        "rule_code": "CORR-SEC-001",
        "name": "Security Control Policy / Logging Modification Event",
        "description": "Detects security control modification or logging policy changes.",
        "rule_type": "MULTI_EVENT",
        "severity": "HIGH",
        "window_seconds": 300,
        "threshold": 1,
        "conditions_json": json.dumps({"event_type": "SECURITY_CONTROL"}),
        "technique_id": "T1562"
    },
    {
        "rule_code": "CORR-IOC-001",
        "name": "Known Indicator of Compromise (IOC) Observed in Telemetry",
        "description": "Triggers high-priority alert when an event matches an active threat intelligence IOC.",
        "rule_type": "MULTI_EVENT",
        "severity": "CRITICAL",
        "window_seconds": 10,
        "threshold": 1,
        "conditions_json": json.dumps({"event_type": "IOC_MATCH"}),
        "technique_id": "T1071"
    }
]

def seed_correlation_rules_if_missing(db: Session):
    """
    Seeds default correlation rules into the database if table is empty.
    """
    if db.query(CorrelationRule).count() == 0:
        for r_def in DEFAULT_CORRELATION_RULES:
            rule = CorrelationRule(
                rule_code=r_def["rule_code"],
                name=r_def["name"],
                description=r_def["description"],
                rule_type=r_def["rule_type"],
                severity=r_def["severity"],
                window_seconds=r_def["window_seconds"],
                threshold=r_def["threshold"],
                conditions_json=r_def["conditions_json"],
                technique_id=r_def["technique_id"],
                enabled=True
            )
            db.add(rule)
        db.commit()
