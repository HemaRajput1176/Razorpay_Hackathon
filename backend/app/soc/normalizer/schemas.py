from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, Optional

@dataclass
class RawTelemetryEvent:
    source: str
    event_type: str
    raw_payload: Dict[str, Any]
    timestamp: Optional[datetime] = None

@dataclass
class NormalizedEventData:
    event_code: str
    timestamp: datetime
    event_type: str # AUTHENTICATION, AUTH_FAILURE, AUTH_SUCCESS, PROCESS, NETWORK, HTTP, API, SYSTEM, IOC_MATCH
    source_type: str
    source: str # WEB-01, API-01, DB-01, etc.
    asset_id: str
    asset_hostname: Optional[str] = None
    source_ip: Optional[str] = "10.240.0.100"
    destination_ip: Optional[str] = "10.240.0.10"
    source_port: Optional[int] = None
    destination_port: Optional[int] = 80
    protocol: str = "TCP"
    user: Optional[str] = None
    process: Optional[str] = None
    action: str = "UNKNOWN"
    result: str = "SUCCESS"
    severity: str = "INFO"
    request_id: Optional[str] = None
    session_id: Optional[str] = None
    exercise_run_id: Optional[str] = None
    assessment_run_id: Optional[str] = None
    raw_reference: Optional[str] = None
    metadata_json: Optional[str] = "{}"
    
    # Enrichment fields
    asset_criticality: str = "HIGH"
    environment: str = "ISOLATED_LAB"
    mitre_technique: Optional[str] = None
    matched_ioc_id: Optional[str] = None
