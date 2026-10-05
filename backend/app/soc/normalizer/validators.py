import ipaddress
from datetime import datetime
from typing import Tuple, Dict, Any

VALID_EVENT_TYPES = {
    "AUTHENTICATION", "AUTH_FAILURE", "AUTH_SUCCESS", "AUTHORIZATION",
    "PROCESS", "NETWORK", "DNS", "HTTP", "API", "FILE", "CONTAINER",
    "SYSTEM", "DATABASE", "CONFIGURATION", "SECURITY_CONTROL",
    "EXERCISE", "ASSESSMENT", "IOC_MATCH"
}

VALID_SEVERITIES = {"INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"}

def validate_raw_event(payload: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validates mandatory telemetry payload fields.
    """
    if not isinstance(payload, dict):
        return False, "Payload must be a dictionary object."

    if not payload.get("action"):
        return False, "Missing mandatory field 'action'."

    if not payload.get("source") and not payload.get("asset_id"):
        return False, "Missing mandatory location identifiers 'source' or 'asset_id'."

    return True, "Valid"

def sanitize_ip(ip_str: str, default: str = "10.240.0.100") -> str:
    if not ip_str:
        return default
    try:
        ipaddress.ip_address(ip_str)
        return ip_str
    except ValueError:
        return default
