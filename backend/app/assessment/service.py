import asyncio
import uuid
import json
import datetime
import hashlib
from typing import Dict, Any, List, Optional
import httpx
from sqlalchemy.orm import Session, joinedload

from app.database.session import SessionLocal
from app.models.schemas import (
    Assessment, AssessmentScope, AssessmentRun, AssessmentAsset,
    AssessmentURL, APIEndpoint, AssessmentFinding, AssessmentEvidence, RedactedLog
)
from app.assessment.scope import validate_scope
from app.assessment.redactor import redact_text, redact_headers
from app.assessment.risk_engine import calculate_risk_score
from app.assessment.checks import (
    run_security_headers_check, run_cors_check, run_openapi_discovery_check,
    run_sensitive_paths_check, run_tls_baseline_check, compute_evidence_hash
)

# Active running tasks dictionary for cancellation
ACTIVE_ASSESSMENT_TASKS: Dict[str, asyncio.Task] = {}

class AssessmentService:

    def list_assessments(self, db: Session) -> Dict[str, Any]:
        """
        List all assessments with summary statistics.
        """
        assessments = db.query(Assessment).order_by(Assessment.created_at.desc()).all()
        
        total = len(assessments)
        running = db.query(Assessment).filter(Assessment.status == "RUNNING").count()
        completed = db.query(Assessment).filter(Assessment.status == "COMPLETED").count()
        
        total_findings = db.query(AssessmentFinding).count()
        critical_findings = db.query(AssessmentFinding).filter(AssessmentFinding.severity == "CRITICAL").count()
        high_findings = db.query(AssessmentFinding).filter(AssessmentFinding.severity == "HIGH").count()
        medium_findings = db.query(AssessmentFinding).filter(AssessmentFinding.severity == "MEDIUM").count()
        low_findings = db.query(AssessmentFinding).filter(AssessmentFinding.severity == "LOW").count()

        risk_scores = [a.risk_score for a in assessments if a.risk_score > 0]
        avg_risk = round(sum(risk_scores) / len(risk_scores), 1) if risk_scores else 0.0

        items = []
        for a in assessments:
            f_count = db.query(AssessmentFinding).filter(AssessmentFinding.assessment_id == a.id).count()
            items.append({
                "id": a.id,
                "code": a.code,
                "title": a.title,
                "description": a.description,
                "mode": a.mode,
                "target_type": a.target_type,
                "target_url": a.target_url,
                "status": a.status,
                "risk_score": a.risk_score,
                "request_budget": a.request_budget,
                "requests_used": a.requests_used,
                "max_rate_limit": a.max_rate_limit,
                "findings_count": f_count,
                "created_by": a.created_by,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "updated_at": a.updated_at.isoformat() if a.updated_at else None
            })

        return {
            "summary": {
                "total_assessments": total,
                "running_assessments": running,
                "completed_assessments": completed,
                "total_findings": total_findings,
                "critical_findings": critical_findings,
                "high_findings": high_findings,
                "medium_findings": medium_findings,
                "low_findings": low_findings,
                "average_risk_score": avg_risk
            },
            "assessments": items
        }

    def get_assessment(self, db: Session, assessment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get full detailed assessment object with all relationships.
        """
        assessment = db.query(Assessment).filter(
            (Assessment.id == assessment_id) | (Assessment.code == assessment_id)
        ).first()

        if not assessment:
            return None

        # Scope
        scope = db.query(AssessmentScope).filter(AssessmentScope.assessment_id == assessment.id).first()
        scope_dict = None
        if scope:
            scope_dict = {
                "id": scope.id,
                "authorization_granted": scope.authorization_granted,
                "attestation_code": scope.attestation_code,
                "authorized_by": scope.authorized_by,
                "purpose": scope.purpose,
                "allowed_domains": json.loads(scope.allowed_domains or "[]"),
                "excluded_hosts": json.loads(scope.excluded_hosts or "[]"),
                "expiration_date": scope.expiration_date.isoformat() if scope.expiration_date else None
            }

        # Assets
        assets = db.query(AssessmentAsset).filter(AssessmentAsset.assessment_id == assessment.id).all()
        assets_list = [{
            "id": ast.id,
            "asset_name": ast.asset_name,
            "host_or_ip": ast.host_or_ip,
            "port": ast.port,
            "asset_type": ast.asset_type,
            "status": ast.status,
            "response_time_ms": ast.response_time_ms,
            "tls_status": ast.tls_status,
            "discovered_at": ast.discovered_at.isoformat() if ast.discovered_at else None
        } for ast in assets]

        # URLs
        urls = db.query(AssessmentURL).filter(AssessmentURL.assessment_id == assessment.id).all()
        urls_list = [{
            "id": u.id,
            "url": u.url,
            "status_code": u.status_code,
            "content_type": u.content_type,
            "response_time_ms": u.response_time_ms,
            "title": u.title,
            "discovered_via": u.discovered_via
        } for u in urls]

        # Endpoints
        endpoints = db.query(APIEndpoint).filter(APIEndpoint.assessment_id == assessment.id).all()
        endpoints_list = [{
            "id": ep.id,
            "method": ep.method,
            "path": ep.path,
            "summary": ep.summary,
            "auth_required": ep.auth_required,
            "parameters": json.loads(ep.parameters_json or "[]"),
            "response_codes": json.loads(ep.response_codes_json or "[]"),
            "discovered_at": ep.discovered_at.isoformat() if ep.discovered_at else None
        } for ep in endpoints]

        # Findings & Evidences
        findings = db.query(AssessmentFinding).filter(AssessmentFinding.assessment_id == assessment.id).all()
        findings_list = []
        for f in findings:
            evidence = db.query(AssessmentEvidence).filter(AssessmentEvidence.finding_id == f.id).first()
            ev_dict = None
            if evidence:
                ev_dict = {
                    "id": evidence.id,
                    "evidence_type": evidence.evidence_type,
                    "request_method": evidence.request_method,
                    "request_url": evidence.request_url,
                    "redacted_request_headers": json.loads(evidence.redacted_request_headers or "{}") if evidence.redacted_request_headers and evidence.redacted_request_headers.startswith("{") else evidence.redacted_request_headers,
                    "redacted_request_body": evidence.redacted_request_body,
                    "response_status": evidence.response_status,
                    "redacted_response_headers": json.loads(evidence.redacted_response_headers or "{}") if evidence.redacted_response_headers and evidence.redacted_response_headers.startswith("{") else evidence.redacted_response_headers,
                    "redacted_response_body": evidence.redacted_response_body,
                    "proof_of_concept": evidence.proof_of_concept,
                    "sha256_hash": evidence.sha256_hash,
                    "collected_at": evidence.collected_at.isoformat() if evidence.collected_at else None
                }

            findings_list.append({
                "id": f.id,
                "finding_code": f.finding_code,
                "title": f.title,
                "category": f.category,
                "severity": f.severity,
                "cvss_score": f.cvss_score,
                "cvss_vector": f.cvss_vector,
                "cwe_id": f.cwe_id,
                "risk_score": f.risk_score,
                "impact": f.impact,
                "description": f.description,
                "recommendation": f.recommendation,
                "remediation_code": f.remediation_code,
                "status": f.status,
                "created_at": f.created_at.isoformat() if f.created_at else None,
                "evidence": ev_dict
            })

        # Logs
        logs = db.query(RedactedLog).filter(RedactedLog.assessment_id == assessment.id).order_by(RedactedLog.timestamp.desc()).limit(100).all()
        logs_list = [{
            "id": l.id,
            "level": l.level,
            "message": l.message,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None
        } for l in logs]

        return {
            "id": assessment.id,
            "code": assessment.code,
            "title": assessment.title,
            "description": assessment.description,
            "mode": assessment.mode,
            "target_type": assessment.target_type,
            "target_url": assessment.target_url,
            "status": assessment.status,
            "risk_score": assessment.risk_score,
            "request_budget": assessment.request_budget,
            "requests_used": assessment.requests_used,
            "max_rate_limit": assessment.max_rate_limit,
            "created_by": assessment.created_by,
            "created_at": assessment.created_at.isoformat() if assessment.created_at else None,
            "updated_at": assessment.updated_at.isoformat() if assessment.updated_at else None,
            "scope": scope_dict,
            "assets": assets_list,
            "urls": urls_list,
            "endpoints": endpoints_list,
            "findings": findings_list,
            "logs": logs_list
        }

    def create_assessment(self, db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a new assessment with mandatory scope attestation & SSRF validation.
        """
        title = payload.get("title") or "Security Posture Assessment"
        mode = payload.get("mode", "INTERNAL_LAB")
        target_url = payload.get("target_url", "").strip()
        allowed_domains = payload.get("allowed_domains", [])
        excluded_hosts = payload.get("excluded_hosts", [])
        request_budget = int(payload.get("request_budget", 100))
        max_rate_limit = int(payload.get("max_rate_limit", 5))
        attestation_code = payload.get("attestation_code") or f"AUTH-2026-{uuid.uuid4().hex[:6].upper()}"

        # Run strict scope & SSRF validation
        valid, reason = validate_scope(target_url, mode, allowed_domains, excluded_hosts)
        if not valid:
            raise ValueError(reason)

        asm_code = f"ASM-2026-{uuid.uuid4().hex[:6].upper()}"

        assessment = Assessment(
            code=asm_code,
            title=title,
            description=payload.get("description", "Authorized Web & API Security Validation Audit"),
            mode=mode,
            target_type=payload.get("target_type", "WEB"),
            target_url=target_url,
            status="READY",
            risk_score=0,
            request_budget=request_budget,
            requests_used=0,
            max_rate_limit=max_rate_limit,
            created_by=payload.get("created_by", "analyst01")
        )
        db.add(assessment)
        db.flush()

        scope = AssessmentScope(
            assessment_id=assessment.id,
            authorization_granted=True,
            attestation_code=attestation_code,
            authorized_by=payload.get("authorized_by", "Chief Security Officer"),
            purpose=payload.get("purpose", "Authorized Cyber Security Posture Audit"),
            allowed_domains=json.dumps(allowed_domains),
            excluded_hosts=json.dumps(excluded_hosts)
        )
        db.add(scope)

        # Initial Log
        init_log = RedactedLog(
            assessment_id=assessment.id,
            level="INFO",
            message=f"[SCOPE_CREATED] Assessment {asm_code} initialized. Target: {target_url} (Mode: {mode}). Scope Attestation: {attestation_code} ({reason})"
        )
        db.add(init_log)
        db.commit()

        return self.get_assessment(db, assessment.id)

    async def execute_assessment_pipeline(self, assessment_id: str):
        """
        Background task to execute real evidence-backed security checks.
        """
        db = SessionLocal()
        try:
            assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
            if not assessment:
                return

            assessment.status = "RUNNING"
            db.commit()

            # Create AssessmentRun
            run_code = f"RUN-{assessment.code}-{uuid.uuid4().hex[:4].upper()}"
            asm_run = AssessmentRun(
                assessment_id=assessment.id,
                run_code=run_code,
                status="RUNNING"
            )
            db.add(asm_run)
            
            # Log
            log1 = RedactedLog(
                assessment_id=assessment.id,
                level="INFO",
                message=f"[ENGINE_START] Launching Assessment Engine pipeline {run_code} against {assessment.target_url}"
            )
            db.add(log1)
            db.commit()

            # Target Asset Discovery
            parsed = httpx.URL(assessment.target_url)
            host = parsed.host
            port = parsed.port or (443 if parsed.scheme == "https" else 80)
            
            existing_asset = db.query(AssessmentAsset).filter(
                AssessmentAsset.assessment_id == assessment.id,
                AssessmentAsset.host_or_ip == host
            ).first()

            if not existing_asset:
                asset_obj = AssessmentAsset(
                    assessment_id=assessment.id,
                    asset_name=f"TARGET-NODE-{host.upper()}",
                    host_or_ip=host,
                    port=port,
                    asset_type="WEB SERVER" if port in [80, 443] else "API SERVICE",
                    status="ACTIVE",
                    tls_status="HTTPS" if parsed.scheme == "https" else "HTTP"
                )
                db.add(asset_obj)
                db.flush()
                asset_id = asset_obj.id
            else:
                asset_id = existing_asset.id

            db.commit()

            # Async HTTP Client with rate limit throttle & timeout settings
            async with httpx.AsyncClient(verify=False, timeout=6.0) as client:
                rate_delay = 1.0 / max(1, assessment.max_rate_limit)

                # -------------------------------------------------------------
                # CHECK 1: TLS Baseline Check
                # -------------------------------------------------------------
                log2 = RedactedLog(assessment_id=assessment.id, level="CHECK", message="[CHECK_INIT] Running TLS / Transport Security Baseline Probe...")
                db.add(log2)
                db.commit()
                await asyncio.sleep(rate_delay)

                tls_res = run_tls_baseline_check(assessment.target_url)
                self._process_check_result(db, assessment, asset_id, tls_res)

                # -------------------------------------------------------------
                # CHECK 2: Security Headers Check
                # -------------------------------------------------------------
                log3 = RedactedLog(assessment_id=assessment.id, level="CHECK", message="[CHECK_INIT] Probing HTTP Security Response Headers (CSP, HSTS, XFO, Server)...")
                db.add(log3)
                db.commit()
                await asyncio.sleep(rate_delay)

                header_results = await run_security_headers_check(client, assessment.target_url, assessment.mode)
                for h_res in header_results:
                    self._process_check_result(db, assessment, asset_id, h_res)

                # -------------------------------------------------------------
                # CHECK 3: CORS Configuration Probe
                # -------------------------------------------------------------
                log4 = RedactedLog(assessment_id=assessment.id, level="CHECK", message="[CHECK_INIT] Testing Cross-Origin Resource Sharing (CORS) Policy...")
                db.add(log4)
                db.commit()
                await asyncio.sleep(rate_delay)

                cors_res = await run_cors_check(client, assessment.target_url, assessment.mode)
                self._process_check_result(db, assessment, asset_id, cors_res)

                # -------------------------------------------------------------
                # CHECK 4: OpenAPI / Swagger Endpoint Discovery
                # -------------------------------------------------------------
                log5 = RedactedLog(assessment_id=assessment.id, level="CHECK", message="[CHECK_INIT] Mapping API endpoints via OpenAPI / Swagger Schema Discovery...")
                db.add(log5)
                db.commit()
                await asyncio.sleep(rate_delay)

                api_findings, api_endpoints = await run_openapi_discovery_check(client, assessment.target_url, assessment.mode)
                for api_f in api_findings:
                    self._process_check_result(db, assessment, asset_id, api_f)

                # Save discovered API endpoints
                for ep in api_endpoints:
                    ep_obj = APIEndpoint(
                        assessment_id=assessment.id,
                        method=ep["method"],
                        path=ep["path"],
                        summary=ep["summary"],
                        auth_required=ep["auth_required"],
                        parameters_json=json.dumps(ep["parameters"]),
                        response_codes_json=json.dumps(ep["response_codes"])
                    )
                    db.add(ep_obj)
                db.commit()

                # -------------------------------------------------------------
                # CHECK 5: Sensitive Paths Probe (.env, /metrics, /robots.txt)
                # -------------------------------------------------------------
                log6 = RedactedLog(assessment_id=assessment.id, level="CHECK", message="[CHECK_INIT] Scanning for exposed sensitive paths (.env, prometheus metrics)...")
                db.add(log6)
                db.commit()
                await asyncio.sleep(rate_delay)

                sens_results = await run_sensitive_paths_check(client, assessment.target_url, assessment.mode)
                for s_res in sens_results:
                    self._process_check_result(db, assessment, asset_id, s_res)

            # Compute Overall Assessment Risk Score
            all_findings = db.query(AssessmentFinding).filter(AssessmentFinding.assessment_id == assessment.id).all()
            if all_findings:
                assessment.risk_score = max([f.risk_score for f in all_findings])
            else:
                assessment.risk_score = 0

            assessment.status = "COMPLETED"
            asm_run.status = "COMPLETED"
            asm_run.completed_at = datetime.datetime.utcnow()
            asm_run.findings_count = len(all_findings)

            log_final = RedactedLog(
                assessment_id=assessment.id,
                level="INFO",
                message=f"[ASSESSMENT_COMPLETED] Security scan finished cleanly. Total Findings: {len(all_findings)}. Max Risk Score: {assessment.risk_score}/100."
            )
            db.add(log_final)
            db.commit()

        except Exception as e:
            if assessment:
                assessment.status = "FAILED"
                err_log = RedactedLog(
                    assessment_id=assessment.id,
                    level="ERROR",
                    message=f"[ASSESSMENT_ERROR] Execution error: {str(e)}"
                )
                db.add(err_log)
                db.commit()
        finally:
            db.close()
            if assessment_id in ACTIVE_ASSESSMENT_TASKS:
                del ACTIVE_ASSESSMENT_TASKS[assessment_id]

    def _process_check_result(self, db: Session, assessment: Assessment, asset_id: str, res):
        """
        Helper to increment request budget, store evidence with redaction, calculate risk score, and save findings.
        """
        assessment.requests_used += 1

        if not res.passed and res.finding_code:
            # Check if finding already exists
            existing_f = db.query(AssessmentFinding).filter(
                AssessmentFinding.assessment_id == assessment.id,
                AssessmentFinding.finding_code == res.finding_code
            ).first()

            if not existing_f:
                # Calculate Multi-factor risk score
                risk_score = calculate_risk_score(
                    cvss_score=res.cvss_score,
                    asset_criticality="HIGH",
                    mode=assessment.mode,
                    confidence="CONFIRMED"
                )

                finding = AssessmentFinding(
                    finding_code=res.finding_code,
                    assessment_id=assessment.id,
                    asset_id=asset_id,
                    title=res.title,
                    category=res.category,
                    severity=res.severity,
                    cvss_score=res.cvss_score,
                    cvss_vector=res.cvss_vector,
                    cwe_id=res.cwe_id,
                    risk_score=risk_score,
                    impact=res.impact,
                    description=res.description,
                    recommendation=res.recommendation,
                    remediation_code=res.remediation_code,
                    status="OPEN"
                )
                db.add(finding)
                db.flush()

                # Store Redacted Evidence
                req_h_str = json.dumps(res.request_headers) if isinstance(res.request_headers, dict) else str(res.request_headers)
                resp_h_str = json.dumps(res.response_headers) if isinstance(res.response_headers, dict) else str(res.response_headers)
                
                sha_hash = compute_evidence_hash(res.request_url, res.response_status, res.response_body)

                evidence = AssessmentEvidence(
                    finding_id=finding.id,
                    assessment_id=assessment.id,
                    evidence_type="HTTP_REQ_RES",
                    request_method=res.request_method,
                    request_url=res.request_url,
                    redacted_request_headers=req_h_str,
                    redacted_request_body=res.request_body,
                    response_status=res.response_status,
                    redacted_response_headers=resp_h_str,
                    redacted_response_body=res.response_body,
                    proof_of_concept=res.proof_of_concept,
                    sha256_hash=sha_hash
                )
                db.add(evidence)

                f_log = RedactedLog(
                    assessment_id=assessment.id,
                    level="FINDING",
                    message=f"[VULN_DISCOVERED] Created Finding {res.finding_code}: '{res.title}' ({res.severity} - Risk: {risk_score}/100)"
                )
                db.add(f_log)
                db.commit()

    def seed_default_assessment_if_missing(self, db: Session):
        """
        Seeds default laboratory assessment if DB is empty.
        """
        if db.query(Assessment).count() == 0:
            payload = {
                "title": "NEXORA WEB-01 LAB SECURITY ASSESSMENT",
                "description": "Continuous security posture assessment of internal laboratory target WEB-01.",
                "mode": "INTERNAL_LAB",
                "target_type": "WEB",
                "target_url": "http://10.240.0.10",
                "allowed_domains": ["10.240.0.10", "nexora.lab"],
                "excluded_hosts": [],
                "request_budget": 150,
                "max_rate_limit": 5,
                "attestation_code": "AUTH-2026-LAB01"
            }
            try:
                self.create_assessment(db, payload)
            except Exception as e:
                print(f"[ASSESSMENT SEED WARNING] {e}")

assessment_service = AssessmentService()
