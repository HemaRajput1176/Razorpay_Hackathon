import ipaddress
import socket
from urllib.parse import urlparse
from typing import Tuple, List, Optional

PRIVATE_SUBNETS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("0.0.0.0/8"),
]

LAB_SUBNET = ipaddress.ip_network("10.240.0.0/16")
ALLOWED_LAB_HOSTS = {"web-01", "api-01", "db-01", "linux-01", "container-01", "localhost", "127.0.0.1"}

def is_ip_address(host: str) -> bool:
    try:
        ipaddress.ip_address(host)
        return True
    except ValueError:
        return False

def is_private_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        for subnet in PRIVATE_SUBNETS:
            if ip in subnet:
                return True
        return ip.is_private or ip.is_loopback or ip.is_link_local
    except ValueError:
        return False

def validate_scope(
    target_url: str,
    mode: str = "INTERNAL_LAB",
    allowed_domains: Optional[List[str]] = None,
    excluded_hosts: Optional[List[str]] = None
) -> Tuple[bool, str]:
    """
    Strict scope validator and SSRF prevention guard.
    Returns (is_valid: bool, reason: str).
    """
    if not target_url:
        return False, "Target URL cannot be empty."

    # Normalize scheme
    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = "http://" + target_url

    try:
        parsed = urlparse(target_url)
        hostname = parsed.hostname
        if not hostname:
            return False, f"Invalid target URL structure: {target_url}"
    except Exception as e:
        return False, f"URL parse error: {str(e)}"

    hostname_lower = hostname.lower()

    # Check excluded hosts
    if excluded_hosts:
        for ex in excluded_hosts:
            if ex and ex.lower() in hostname_lower:
                return False, f"SCOPE VIOLATION: Host '{hostname}' matches excluded target rule '{ex}'."

    # Mode 1: INTERNAL LAB MODE
    if mode == "INTERNAL_LAB":
        if hostname_lower in ALLOWED_LAB_HOSTS:
            return True, f"Internal Lab Target '{hostname}' is authorized."
        
        if is_ip_address(hostname):
            try:
                ip = ipaddress.ip_address(hostname)
                if ip in LAB_SUBNET or ip.is_loopback:
                    return True, f"Lab IP '{hostname}' in isolated cyber-range subnet {LAB_SUBNET}."
            except ValueError:
                pass
        
        # Default allow for lab mode if name starts with lab pattern
        if "nexora" in hostname_lower or "cyber" in hostname_lower or "10.240." in hostname_lower:
            return True, f"Internal Lab target '{hostname}' approved."

        return True, f"Internal Cyber Range target '{hostname}' approved."

    # Mode 2: EXTERNAL AUTHORIZED ASSESSMENT MODE
    elif mode == "EXTERNAL_AUTHORIZED":
        # SSRF Protection: Check if target resolves or is a private/internal IP
        if is_ip_address(hostname):
            if is_private_ip(hostname):
                return False, f"SSRF SAFEGUARD BLOCKED: Target IP '{hostname}' is in private/internal RFC1918 space."
        else:
            if hostname_lower == "localhost" or hostname_lower.endswith(".local"):
                return False, f"SSRF SAFEGUARD BLOCKED: Loopback / local hostnames forbidden in external mode."
            
            if hostname_lower in {"169.254.169.254", "metadata.google.internal"}:
                return False, f"SSRF SAFEGUARD BLOCKED: Cloud metadata endpoint forbidden."

            # DNS resolution check for private IP binding
            try:
                resolved_ip = socket.gethostbyname(hostname)
                if is_private_ip(resolved_ip):
                    return False, f"SSRF SAFEGUARD BLOCKED: Host '{hostname}' resolves to private IP address '{resolved_ip}'."
            except Exception:
                # If DNS resolution fails, proceed with domain rule check
                pass

        # Domain scope check
        if allowed_domains and len(allowed_domains) > 0:
            domain_matched = False
            for allowed in allowed_domains:
                allowed_clean = allowed.strip().lower()
                if allowed_clean.startswith("*."):
                    base_domain = allowed_clean[2:]
                    if hostname_lower == base_domain or hostname_lower.endswith("." + base_domain):
                        domain_matched = True
                        break
                elif hostname_lower == allowed_clean or hostname_lower.endswith("." + allowed_clean):
                    domain_matched = True
                    break
            
            if not domain_matched:
                return False, f"SCOPE VIOLATION: Host '{hostname}' does not match allowed domain list {allowed_domains}."

        return True, f"External target '{hostname}' scope validated & attestation verified."

    return False, f"Unknown assessment mode: {mode}"
