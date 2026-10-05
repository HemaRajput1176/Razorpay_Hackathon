import hashlib
import json
import ssl
import socket
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional, Tuple
import httpx

from app.assessment.redactor import redact_text, redact_headers
from app.assessment.risk_engine import calculate_risk_score

class CheckResult:
    def __init__(
        self,
        check_name: str,
        passed: bool,
        finding_code: Optional[str] = None,
        title: Optional[str] = None,
        category: Optional[str] = None,
        severity: str = "INFO",
        cvss_score: float = 0.0,
        cvss_vector: str = "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N",
        cwe_id: str = "CWE-693",
        impact: str = "",
        description: str = "",
        recommendation: str = "",
        remediation_code: str = "",
        request_method: str = "GET",
        request_url: str = "",
        request_headers: Optional[Dict[str, str]] = None,
        request_body: str = "",
        response_status: int = 200,
        response_headers: Optional[Dict[str, str]] = None,
        response_body: str = "",
        proof_of_concept: str = ""
    ):
        self.check_name = check_name
        self.passed = passed
        self.finding_code = finding_code
        self.title = title
        self.category = category
        self.severity = severity
        self.cvss_score = cvss_score
        self.cvss_vector = cvss_vector
        self.cwe_id = cwe_id
        self.impact = impact
        self.description = description
        self.recommendation = recommendation
        self.remediation_code = remediation_code
        self.request_method = request_method
        self.request_url = request_url
        self.request_headers = request_headers or {}
        self.request_body = request_body
        self.response_status = response_status
        self.response_headers = response_headers or {}
        self.response_body = response_body
        self.proof_of_concept = proof_of_concept

def compute_evidence_hash(url: str, status: int, body: str) -> str:
    raw = f"{url}|{status}|{body}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

async def run_security_headers_check(
    client: httpx.AsyncClient,
    target_url: str,
    mode: str = "INTERNAL_LAB"
) -> List[CheckResult]:
    """
    Checks HTTP Security Headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Server Disclosure).
    """
    results = []
    req_headers = {"User-Agent": "CYBERNEXUS-Security-Validation-Engine/3.0"}
    
    try:
        resp = await client.get(target_url, headers=req_headers, timeout=5.0, follow_redirects=True)
        headers = dict(resp.headers)
        redacted_req_h = redact_headers(req_headers)
        redacted_resp_h = redact_headers(headers)
        resp_text_snippet = redact_text(resp.text[:1000])
        
        # 1. Content-Security-Policy (CSP)
        if "content-security-policy" not in [k.lower() for k in headers.keys()]:
            results.append(CheckResult(
                check_name="Security Header: CSP",
                passed=False,
                finding_code="FND-ASM-CSP-01",
                title="Missing Content-Security-Policy (CSP) Header",
                category="HEADERS",
                severity="HIGH",
                cvss_score=7.2,
                cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
                cwe_id="CWE-693",
                impact="Without CSP, the target application is vulnerable to Cross-Site Scripting (XSS), data injection, and unauthorized script execution in client browser context.",
                description="The target web service does not enforce a Content-Security-Policy header. Browsers will execute any client-side scripts included in HTML response pages.",
                recommendation="Configure a restrictive Content-Security-Policy header defining trusted script, style, and iframe sources.",
                remediation_code="Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none';",
                request_method="GET",
                request_url=str(resp.url),
                request_headers=redacted_req_h,
                response_status=resp.status_code,
                response_headers=redacted_resp_h,
                response_body=resp_text_snippet,
                proof_of_concept=f"HTTP GET {resp.url} returned HTTP {resp.status_code} without Content-Security-Policy response header."
            ))
        else:
            results.append(CheckResult(check_name="Security Header: CSP", passed=True))

        # 2. Strict-Transport-Security (HSTS)
        if "strict-transport-security" not in [k.lower() for k in headers.keys()]:
            results.append(CheckResult(
                check_name="Security Header: HSTS",
                passed=False,
                finding_code="FND-ASM-HSTS-01",
                title="Missing HTTP Strict Transport Security (HSTS) Header",
                category="HEADERS",
                severity="MEDIUM",
                cvss_score=5.3,
                cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
                cwe_id="CWE-319",
                impact="Allows active network attackers to downgrade HTTPS connections to unencrypted HTTP, exposing user sessions to man-in-the-middle (MITM) interception.",
                description="The Strict-Transport-Security response header is missing. HSTS enforces HTTPS-only browser connections.",
                recommendation="Enforce HSTS with a long max-age and includeSubDomains parameter.",
                remediation_code="Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
                request_method="GET",
                request_url=str(resp.url),
                request_headers=redacted_req_h,
                response_status=resp.status_code,
                response_headers=redacted_resp_h,
                response_body=resp_text_snippet,
                proof_of_concept=f"HTTP response header 'Strict-Transport-Security' missing from server response."
            ))
        else:
            results.append(CheckResult(check_name="Security Header: HSTS", passed=True))

        # 3. X-Frame-Options
        if "x-frame-options" not in [k.lower() for k in headers.keys()]:
            results.append(CheckResult(
                check_name="Security Header: X-Frame-Options",
                passed=False,
                finding_code="FND-ASM-XFO-01",
                title="Missing X-Frame-Options Clickjacking Defense",
                category="HEADERS",
                severity="MEDIUM",
                cvss_score=4.3,
                cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N",
                cwe_id="CWE-1021",
                impact="Attacker can embed the target application inside a transparent <iframe> on a malicious web page to trick users into performing unintended actions (Clickjacking).",
                description="The server does not specify X-Frame-Options header (DENY or SAMEORIGIN).",
                recommendation="Set X-Frame-Options: DENY or SAMEORIGIN across all HTML endpoints.",
                remediation_code="X-Frame-Options: SAMEORIGIN",
                request_method="GET",
                request_url=str(resp.url),
                request_headers=redacted_req_h,
                response_status=resp.status_code,
                response_headers=redacted_resp_h,
                response_body=resp_text_snippet,
                proof_of_concept=f"Missing X-Frame-Options header on {resp.url}"
            ))
        else:
            results.append(CheckResult(check_name="Security Header: X-Frame-Options", passed=True))

        # 4. Server Version Disclosure
        server_val = headers.get("server") or headers.get("Server") or headers.get("x-powered-by")
        if server_val:
            results.append(CheckResult(
                check_name="Information Disclosure: Server Header",
                passed=False,
                finding_code="FND-ASM-INFO-01",
                title="Server Technology & Version Information Disclosure",
                category="ENUMERATION",
                severity="LOW",
                cvss_score=3.7,
                cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
                cwe_id="CWE-200",
                impact="Provides precise software version details to threat actors, simplifying targeted exploit selection.",
                description=f"Server returned technology disclosure header: '{server_val}'.",
                recommendation="Obfuscate or remove Server and X-Powered-By response headers.",
                remediation_code="Server: NEXORA-EDGE-SECURE",
                request_method="GET",
                request_url=str(resp.url),
                request_headers=redacted_req_h,
                response_status=resp.status_code,
                response_headers=redacted_resp_h,
                response_body=resp_text_snippet,
                proof_of_concept=f"Server Header Disclosed: '{server_val}'"
            ))
        else:
            results.append(CheckResult(check_name="Information Disclosure: Server Header", passed=True))

    except Exception as e:
        results.append(CheckResult(
            check_name="Security Headers",
            passed=False,
            finding_code="FND-ASM-ERR-01",
            title="Security Check Probe Timeout / Unreachable",
            category="NETWORK",
            severity="LOW",
            cvss_score=0.0,
            impact="Could not verify security headers.",
            description=f"Target URL {target_url} returned network error: {str(e)}",
            recommendation="Verify target service availability and network routing."
        ))

    return results

async def run_cors_check(
    client: httpx.AsyncClient,
    target_url: str,
    mode: str = "INTERNAL_LAB"
) -> CheckResult:
    """
    Checks CORS configuration for arbitrary origin reflection or insecure wildcard origin.
    """
    probe_origin = "https://evil-attacker-site.com"
    headers = {
        "Origin": probe_origin,
        "User-Agent": "CYBERNEXUS-Security-Validation-Engine/3.0"
    }

    try:
        resp = await client.options(target_url, headers=headers, timeout=5.0)
        acao = resp.headers.get("access-control-allow-origin") or resp.headers.get("Access-Control-Allow-Origin")
        acac = resp.headers.get("access-control-allow-credentials") or resp.headers.get("Access-Control-Allow-Credentials")

        if acao and (acao == probe_origin or acao == "*") and (acac and acac.lower() == "true"):
            return CheckResult(
                check_name="CORS Policy Security",
                passed=False,
                finding_code="FND-ASM-CORS-01",
                title="Insecure Permissive CORS Policy with Credentials Allowed",
                category="CORS",
                severity="HIGH",
                cvss_score=8.1,
                cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N",
                cwe_id="CWE-942",
                impact="Allows untrusted third-party websites to make authenticated API calls on behalf of victim users and exfiltrate private session data.",
                description=f"Target reflected Origin '{probe_origin}' with Access-Control-Allow-Credentials: true.",
                recommendation="Enforce a whitelist of trusted corporate origins and never reflect arbitrary Origin headers with credentials.",
                remediation_code="Access-Control-Allow-Origin: https://trusted.nexora.lab\nAccess-Control-Allow-Credentials: true",
                request_method="OPTIONS",
                request_url=target_url,
                request_headers=redact_headers(headers),
                response_status=resp.status_code,
                response_headers=redact_headers(dict(resp.headers)),
                response_body=redact_text(resp.text[:500]),
                proof_of_concept=f"OPTIONS request with Origin: {probe_origin} resulted in Access-Control-Allow-Origin: {acao} and Access-Control-Allow-Credentials: {acac}"
            )
        elif acao == "*":
            return CheckResult(
                check_name="CORS Policy Security",
                passed=False,
                finding_code="FND-ASM-CORS-02",
                title="Wildcard Cross-Origin Resource Sharing (CORS)",
                category="CORS",
                severity="MEDIUM",
                cvss_score=5.3,
                cwe_id="CWE-942",
                impact="Allows any external web page to read response data from non-authenticated GET requests.",
                description="Server responded with Access-Control-Allow-Origin: *",
                recommendation="Restrict Access-Control-Allow-Origin to authorized domain list.",
                request_method="OPTIONS",
                request_url=target_url,
                response_headers=redact_headers(dict(resp.headers))
            )
        return CheckResult(check_name="CORS Policy Security", passed=True)
    except Exception:
        return CheckResult(check_name="CORS Policy Security", passed=True)

async def run_openapi_discovery_check(
    client: httpx.AsyncClient,
    base_url: str,
    mode: str = "INTERNAL_LAB"
) -> Tuple[List[CheckResult], List[Dict[str, Any]]]:
    """
    Discovers OpenAPI / Swagger endpoints safely without aggressive fuzzing.
    Returns (findings, discovered_endpoints).
    """
    findings = []
    discovered_endpoints = []
    candidate_paths = [
        "/openapi.json",
        "/swagger.json",
        "/api-docs",
        "/v1/openapi.json",
        "/api/v1/openapi.json"
    ]

    base = base_url.rstrip("/")

    for path in candidate_paths:
        target_path = base + path
        try:
            resp = await client.get(target_path, timeout=4.0)
            if resp.status_code == 200 and ("json" in resp.headers.get("content-type", "") or "swagger" in resp.text.lower() or "openapi" in resp.text.lower()):
                # OpenAPI schema found!
                try:
                    data = resp.json()
                    paths_obj = data.get("paths", {})
                    for p_val, methods in paths_obj.items():
                        for m_val, spec in methods.items():
                            if m_val.upper() in ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]:
                                # Check if auth security is defined
                                sec = spec.get("security", data.get("security", []))
                                auth_req = len(sec) > 0
                                discovered_endpoints.append({
                                    "method": m_val.upper(),
                                    "path": p_val,
                                    "summary": spec.get("summary") or spec.get("description") or f"Endpoint {p_val}",
                                    "auth_required": auth_req,
                                    "parameters": [p.get("name") for p in spec.get("parameters", []) if isinstance(p, dict)],
                                    "response_codes": list(spec.get("responses", {}).keys())
                                })
                except Exception:
                    pass

                findings.append(CheckResult(
                    check_name="API Schema Discovery",
                    passed=False,
                    finding_code="FND-ASM-API-01",
                    title="Exposed Public OpenAPI / Swagger Documentation Endpoint",
                    category="API_AUTH",
                    severity="MEDIUM",
                    cvss_score=5.3,
                    cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
                    cwe_id="CWE-200",
                    impact="Exposes full API route architecture, parameter constraints, and internal schemas to unauthenticated users.",
                    description=f"Publicly accessible OpenAPI schema discovered at {target_path}.",
                    recommendation="Require authentication or restrict IP access to internal API documentation endpoints.",
                    remediation_code="# FastApi / Express Security Configuration\nif env.PRODUCTION:\n    app.openapi_url = None",
                    request_method="GET",
                    request_url=target_path,
                    response_status=resp.status_code,
                    response_headers=redact_headers(dict(resp.headers)),
                    response_body=redact_text(resp.text[:1200]),
                    proof_of_concept=f"Successfully fetched active API schema from {target_path}"
                ))
                break # Stop after finding primary schema
        except Exception:
            continue

    return findings, discovered_endpoints

async def run_sensitive_paths_check(
    client: httpx.AsyncClient,
    base_url: str,
    mode: str = "INTERNAL_LAB"
) -> List[CheckResult]:
    """
    Checks safe informational paths (.env, /robots.txt, /health, /metrics).
    """
    results = []
    base = base_url.rstrip("/")
    
    # 1. Check for exposed .env file
    env_url = base + "/.env"
    try:
        resp = await client.get(env_url, timeout=3.0)
        if resp.status_code == 200 and ("DB_PASSWORD" in resp.text or "SECRET_KEY" in resp.text or "PORT=" in resp.text or "DATABASE_" in resp.text):
            results.append(CheckResult(
                check_name="Sensitive File Check: .env",
                passed=False,
                finding_code="FND-ASM-ENV-01",
                title="Critical Environment File (.env) Exposure",
                category="SENSITIVE_PATH",
                severity="CRITICAL",
                cvss_score=9.8,
                cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
                cwe_id="CWE-552",
                impact="Complete compromise of database passwords, secret keys, API credentials, and application integrity.",
                description=f"Direct HTTP access to production .env file allowed at {env_url}.",
                recommendation="Configure web server to deny access to dot-files and keep .env files outside root web directory.",
                remediation_code="location ~ /\\.env {\n    deny all;\n}",
                request_method="GET",
                request_url=env_url,
                response_status=resp.status_code,
                response_body=redact_text(resp.text[:500]),
                proof_of_concept=f"Fetched active environment credentials from {env_url}"
            ))
        else:
            results.append(CheckResult(check_name="Sensitive File Check: .env", passed=True))
    except Exception:
        results.append(CheckResult(check_name="Sensitive File Check: .env", passed=True))

    # 2. Check for exposed metrics endpoint
    metrics_url = base + "/metrics"
    try:
        resp = await client.get(metrics_url, timeout=3.0)
        if resp.status_code == 200 and ("process_cpu_seconds_total" in resp.text or "http_requests_total" in resp.text or "python_gc_objects" in resp.text):
            results.append(CheckResult(
                check_name="Sensitive File Check: Prometheus Metrics",
                passed=False,
                finding_code="FND-ASM-METRICS-01",
                title="Unauthenticated Prometheus Metrics Endpoint Exposure",
                category="ENUMERATION",
                severity="LOW",
                cvss_score=3.7,
                cwe_id="CWE-200",
                impact="Discloses internal runtime performance metrics, system memory, and request volume trends.",
                description=f"Prometheus telemetry metric feed accessible at {metrics_url}.",
                recommendation="Protect /metrics endpoint with basic authentication or restrict to internal monitoring agent IPs.",
                request_method="GET",
                request_url=metrics_url,
                response_status=resp.status_code,
                response_body=redact_text(resp.text[:400])
            ))
        else:
            results.append(CheckResult(check_name="Sensitive File Check: Prometheus Metrics", passed=True))
    except Exception:
        results.append(CheckResult(check_name="Sensitive File Check: Prometheus Metrics", passed=True))

    return results

def run_tls_baseline_check(target_url: str) -> CheckResult:
    """
    Checks TLS / HTTPS protocol baseline.
    """
    parsed = urlparse(target_url)
    if parsed.scheme.lower() != "https":
        return CheckResult(
            check_name="TLS / Transport Encryption",
            passed=False,
            finding_code="FND-ASM-TLS-01",
            title="Unencrypted HTTP Transport Protocol in Use",
            category="TLS",
            severity="HIGH",
            cvss_score=7.4,
            cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
            cwe_id="CWE-319",
            impact="All traffic, session identifiers, and sensitive payload data travel in plaintext, susceptible to network eavesdropping and injection.",
            description=f"Target URL scheme is '{parsed.scheme}'. Plaintext HTTP is active.",
            recommendation="Enable TLS 1.3 encryption and automatically redirect all HTTP traffic to HTTPS.",
            remediation_code="server {\n    listen 80;\n    return 301 https://$host$request_uri;\n}",
            request_method="CONNECT",
            request_url=target_url,
            proof_of_concept=f"Target scheme is unencrypted plaintext {parsed.scheme}://"
        )

    # If scheme is HTTPS, verify certificate
    hostname = parsed.hostname
    port = parsed.port or 443
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=4.0) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                cipher = ssock.cipher()
                version = ssock.version()
                return CheckResult(
                    check_name="TLS / Transport Encryption",
                    passed=True,
                    proof_of_concept=f"Valid TLS Connection established using {version}, Cipher: {cipher[0]}"
                )
    except ssl.SSLError as e:
        return CheckResult(
            check_name="TLS / Transport Encryption",
            passed=False,
            finding_code="FND-ASM-TLS-02",
            title="Invalid / Untrusted TLS Certificate Configuration",
            category="TLS",
            severity="MEDIUM",
            cvss_score=6.5,
            cwe_id="CWE-295",
            impact="Browser warnings and potential vulnerability to active MITM interception.",
            description=f"TLS certificate validation failed: {str(e)}",
            recommendation="Install a valid SSL/TLS certificate issued by a trusted Certificate Authority.",
            request_method="CONNECT",
            request_url=target_url,
            proof_of_concept=f"SSL Handshake Failure: {str(e)}"
        )
    except Exception as e:
        return CheckResult(check_name="TLS / Transport Encryption", passed=True)
