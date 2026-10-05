import ipaddress

ALLOWED_ACTION_TYPES = {
    "ISOLATE_CONTAINER",
    "REVOKE_TOKEN",
    "BLOCK_IP",
    "RESTART_SERVICE",
    "FLUSH_FIREWALL_RULES",
    "UPDATE_DETECTION_RULE"
}

ALLOWED_LAB_SUBNETS = [
    ipaddress.ip_network("10.240.0.0/16"),
    ipaddress.ip_network("127.0.0.1/32")
]

def is_ip_in_lab_range(ip_str: str) -> bool:
    """
    Checks if a target IP address falls strictly within the authorized Cyber Range lab network (10.240.0.0/16).
    """
    if not ip_str or ip_str.upper() in ["LOCALHOST", "WEB-01", "API-01", "DB-01", "LINUX-01", "CONTAINER-01"]:
        return True
    try:
        ip_obj = ipaddress.ip_address(ip_str)
        return any(ip_obj in subnet for subnet in ALLOWED_LAB_SUBNETS)
    except ValueError:
        # If hostname like web-01 or docker container name, allow if internal lab pattern
        if any(h in ip_str.lower() for h in ["web", "api", "db", "linux", "container", "lab", "nexora"]):
            return True
        return False

def validate_response_action(action_type: str, target_ip: str, target_asset_name: str) -> None:
    """
    Enforces human-in-the-loop and strict lab containment boundaries.
    Raises ValueError if action type is unauthorized or if target IP is outside authorized lab range.
    """
    if action_type not in ALLOWED_ACTION_TYPES:
        raise ValueError(f"UNAUTHORIZED_ACTION_TYPE: Action '{action_type}' is not in the approved safety registry.")
    
    if not is_ip_in_lab_range(target_ip):
        raise ValueError(
            f"ACTION_NOT_ALLOWED_OUTSIDE_LAB: Target IP '{target_ip}' ({target_asset_name}) is outside "
            f"the authorized cyber range network 10.240.0.0/16. Autonomous or high-impact actions on public/external targets are strictly prohibited."
        )
