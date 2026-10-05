import uuid
import json
from datetime import datetime
from typing import Dict, Any
from app.soc.normalizer.schemas import NormalizedEventData
from app.soc.normalizer.validators import sanitize_ip

def parse_telemetry(raw: Dict[str, Any]) -> NormalizedEventData:
    """
    Parses and maps heterogeneous lab telemetry into common NormalizedEventData schema.
    """
    now = datetime.utcnow()
    event_code = f"EVT-2026-{uuid.uuid4().hex[:8].upper()}"

    source = raw.get("source") or raw.get("asset_id") or "WEB-01"
    asset_id = raw.get("asset_id") or source
    hostname = raw.get("asset_hostname") or source.lower()

    event_type = raw.get("event_type", "HTTP").upper()
    action = raw.get("action") or raw.get("event") or "LOG_ENTRY"
    result = raw.get("result") or "SUCCESS"
    severity = raw.get("severity", "INFO").upper()

    src_ip = sanitize_ip(raw.get("source_ip"), "10.240.0.100")
    dst_ip = sanitize_ip(raw.get("destination_ip"), "10.240.0.10")

    user = raw.get("user") or raw.get("actor") or "system"
    process = raw.get("process") or "nginx/python"
    req_id = raw.get("request_id") or raw.get("correlation_id") or f"REQ-{uuid.uuid4().hex[:6].upper()}"

    # MITRE ATT&CK Mapping heuristics
    mitre_technique = raw.get("mitre_technique") or raw.get("technique_id")
    if not mitre_technique:
        if event_type in ["AUTH_FAILURE", "AUTHENTICATION"] and "FAILED" in result.upper():
            mitre_technique = "T1110" # Brute Force / Password Guessing
        elif event_type == "AUTHORIZATION" and "ADMIN" in action.upper():
            mitre_technique = "T1078" # Valid Accounts
        elif event_type == "HTTP" and ("SQL" in action.upper() or "XSS" in action.upper() or "EXPLOIT" in action.upper()):
            mitre_technique = "T1190" # Exploit Public-Facing Application

    meta_json = json.dumps(raw.get("metadata") or raw.get("metadata_json") or {})

    return NormalizedEventData(
        event_code=event_code,
        timestamp=now,
        event_type=event_type,
        source_type=raw.get("source_type", "RANGE_TELEMETRY"),
        source=source,
        asset_id=asset_id,
        asset_hostname=hostname,
        source_ip=src_ip,
        destination_ip=dst_ip,
        source_port=raw.get("source_port"),
        destination_port=raw.get("destination_port", 80),
        protocol=raw.get("protocol", "TCP"),
        user=user,
        process=process,
        action=action,
        result=result,
        severity=severity,
        request_id=req_id,
        session_id=raw.get("session_id"),
        exercise_run_id=raw.get("exercise_run_id"),
        assessment_run_id=raw.get("assessment_run_id"),
        raw_reference=raw.get("raw_reference") or str(raw),
        metadata_json=meta_json,
        asset_criticality="HIGH" if source in ["WEB-01", "API-01", "DB-01"] else "MEDIUM",
        environment="ISOLATED_LAB",
        mitre_technique=mitre_technique
    )
