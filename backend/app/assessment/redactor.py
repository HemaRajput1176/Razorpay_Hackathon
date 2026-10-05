import re
from typing import Dict, Any

SENSITIVE_HEADER_KEYS = {
    "authorization", "cookie", "set-cookie", "x-api-key", 
    "x-auth-token", "proxy-authorization", "sec-websocket-key"
}

SENSITIVE_BODY_PATTERNS = [
    (r'(?i)("?password"?\s*[:=]\s*)"[^"]+"', r'\1"[REDACTED_PASSWORD]"'),
    (r'(?i)("?secret"?\s*[:=]\s*)"[^"]+"', r'\1"[REDACTED_SECRET]"'),
    (r'(?i)("?token"?\s*[:=]\s*)"[^"]+"', r'\1"[REDACTED_TOKEN]"'),
    (r'(?i)("?api_?key"?\s*[:=]\s*)"[^"]+"', r'\1"[REDACTED_API_KEY]"'),
    (r'(?i)("?access_?token"?\s*[:=]\s*)"[^"]+"', r'\1"[REDACTED_ACCESS_TOKEN]"'),
    (r'Bearer\s+[A-Za-z0-9\-_\.=]+', r'Bearer [REDACTED_JWT_TOKEN]'),
    (r'eyJ[A-Za-z0-9\-_\=]+\.eyJ[A-Za-z0-9\-_\=]+\.[A-Za-z0-9\-_\=]+', r'[REDACTED_JWT_STRING]'),
    (r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', r'[REDACTED_EMAIL]'),
]

def redact_text(text: str) -> str:
    """
    Strips sensitive credentials, tokens, and authorization headers from text.
    """
    if not text:
        return ""
    
    redacted = text
    for pattern, replacement in SENSITIVE_BODY_PATTERNS:
        redacted = re.sub(pattern, replacement, redacted)
    
    return redacted

def redact_headers(headers: Dict[str, str]) -> Dict[str, str]:
    """
    Redacts sensitive HTTP headers dictionary.
    """
    if not headers:
        return {}

    redacted_headers = {}
    for key, val in headers.items():
        key_lower = key.lower()
        if key_lower in SENSITIVE_HEADER_KEYS:
            if key_lower == "authorization" and val.lower().startswith("bearer"):
                redacted_headers[key] = "Bearer [REDACTED_JWT_TOKEN]"
            else:
                redacted_headers[key] = f"[REDACTED_{key.upper()}]"
        else:
            redacted_headers[key] = redact_text(val)

    return redacted_headers
