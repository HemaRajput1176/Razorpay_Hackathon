import uuid
import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(String(50), default="ANALYST") # ADMIN, SECURITY_ANALYST, RED_TEAM, BLUE_TEAM, VIEWER
    organization = Column(String(100), default="NEXORA ENTERPRISE")
    is_active = Column(Boolean, default=True)
    mfa_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, index=True)
    type = Column(String(50), nullable=False) # SERVER, API, DATABASE, CONTAINER, FIREWALL
    ip_address = Column(String(45))
    hostname = Column(String(100))
    status = Column(String(20), default="ONLINE") # ONLINE, WARNING, COMPROMISED, ISOLATED, OFFLINE
    environment = Column(String(50), default="PRODUCTION")
    criticality = Column(String(20), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), nullable=False)
    role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    target = Column(String(100))
    result = Column(String(20), default="SUCCESS")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# ============================================================
# MILESTONE 2: CYBER RANGE MODELS
# ============================================================

class Lab(Base):
    __tablename__ = "labs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    status = Column(String(30), default="STOPPED") # CREATED, STARTING, RUNNING, STOPPING, STOPPED, RESTARTING, ERROR, DESTROYING
    environment = Column(String(50), default="ISOLATED_CYBER_RANGE")
    created_by = Column(String(50), default="analyst01")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    assets = relationship("LabAsset", back_populates="lab", cascade="all, delete-orphan")
    networks = relationship("LabNetwork", back_populates="lab", cascade="all, delete-orphan")
    events = relationship("LabEvent", back_populates="lab", cascade="all, delete-orphan")
    runs = relationship("LabRun", back_populates="lab", cascade="all, delete-orphan")

class LabAsset(Base):
    __tablename__ = "lab_assets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lab_id = Column(String(36), ForeignKey("labs.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False) # WEB-01, API-01, DB-01, LINUX-01, CONTAINER-01
    hostname = Column(String(100))
    asset_type = Column(String(50), nullable=False)
    ip_address = Column(String(45))
    container_id = Column(String(100))
    os = Column(String(100))
    role = Column(String(150))
    criticality = Column(String(20), default="HIGH")
    status = Column(String(30), default="STOPPED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    lab = relationship("Lab", back_populates="assets")
    services = relationship("LabService", back_populates="asset", cascade="all, delete-orphan")

class LabNetwork(Base):
    __tablename__ = "lab_networks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lab_id = Column(String(36), ForeignKey("labs.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    subnet = Column(String(50), default="10.240.0.0/16")
    gateway = Column(String(45), default="10.240.0.1")
    status = Column(String(30), default="ISOLATED")

    lab = relationship("Lab", back_populates="networks")

class LabService(Base):
    __tablename__ = "lab_services"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id = Column(String(36), ForeignKey("lab_assets.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    protocol = Column(String(20), default="TCP")
    port = Column(Integer, nullable=False)
    status = Column(String(30), default="STOPPED")
    version = Column(String(100))
    last_checked = Column(DateTime, default=datetime.datetime.utcnow)

    asset = relationship("LabAsset", back_populates="services")

class LabEvent(Base):
    __tablename__ = "lab_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lab_id = Column(String(36), ForeignKey("labs.id", ondelete="CASCADE"), nullable=False)
    asset_id = Column(String(36), nullable=True)
    event_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="INFO")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    metadata_json = Column(Text, nullable=True)

    lab = relationship("Lab", back_populates="events")

class LabRun(Base):
    __tablename__ = "lab_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lab_id = Column(String(36), ForeignKey("labs.id", ondelete="CASCADE"), nullable=False)
    started_by = Column(String(50), nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    stopped_at = Column(DateTime, nullable=True)
    status = Column(String(30), default="RUNNING")
    error_message = Column(Text, nullable=True)

    lab = relationship("Lab", back_populates="runs")

# ============================================================
# MILESTONE 3: EXERCISE, TELEMETRY, DETECTION, INCIDENT, EVIDENCE & FINDING SCHEMAS
# ============================================================

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), unique=True, nullable=False, index=True) # EX-001
    name = Column(String(150), nullable=False) # NEXORA WEB SECURITY VALIDATION
    slug = Column(String(100), unique=True, nullable=False, index=True) # nexora-web-security-validation
    description = Column(Text)
    category = Column(String(50), default="WEB SECURITY")
    difficulty = Column(String(20), default="INTERMEDIATE") # BEGINNER, INTERMEDIATE, ADVANCED
    primary_target = Column(String(50), default="WEB-01")
    supporting_targets = Column(String(100), default="API-01, DB-01")
    status = Column(String(30), default="READY") # DRAFT, READY, RUNNING, PAUSED, COMPLETED, FAILED, CANCELLED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    runs = relationship("ExerciseRun", back_populates="exercise", cascade="all, delete-orphan")

class ExerciseRun(Base):
    __tablename__ = "exercise_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exercise_id = Column(String(36), ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False)
    run_code = Column(String(50), unique=True, nullable=False) # RUN-20261005-001
    started_by = Column(String(50), default="analyst01")
    target_lab_id = Column(String(36), nullable=False)
    status = Column(String(30), default="RUNNING") # RUNNING, COMPLETED, FAILED, CANCELLED
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    result = Column(String(30), default="PASS") # PASS, FAIL, INCONCLUSIVE
    score = Column(Float, default=100.0)

    exercise = relationship("Exercise", back_populates="runs")
    steps = relationship("ExerciseStep", back_populates="run", cascade="all, delete-orphan")
    events = relationship("ExerciseEvent", back_populates="run", cascade="all, delete-orphan")
    telemetry_records = relationship("TelemetryEvent", back_populates="run", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="run")
    incidents = relationship("Incident", back_populates="run")
    evidence_records = relationship("Evidence", back_populates="run")

class ExerciseStep(Base):
    __tablename__ = "exercise_steps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exercise_run_id = Column(String(36), ForeignKey("exercise_runs.id", ondelete="CASCADE"), nullable=False)
    step_number = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(String(30), default="COMPLETED") # PENDING, RUNNING, COMPLETED, FAILED
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)
    result = Column(String(50), default="SUCCESS")

    run = relationship("ExerciseRun", back_populates="steps")

class ExerciseEvent(Base):
    __tablename__ = "exercise_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exercise_run_id = Column(String(36), ForeignKey("exercise_runs.id", ondelete="CASCADE"), nullable=False)
    asset_id = Column(String(100), nullable=False)
    event_type = Column(String(50), nullable=False)
    severity = Column(String(20), default="INFO")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    metadata_json = Column(Text, nullable=True)

    run = relationship("ExerciseRun", back_populates="events")

class TelemetryEvent(Base):
    __tablename__ = "telemetry_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exercise_run_id = Column(String(36), ForeignKey("exercise_runs.id", ondelete="CASCADE"), nullable=True)
    request_id = Column(String(50), nullable=False, index=True) # Correlation ID: EX001-7F92...
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    source = Column(String(50), nullable=False) # WEB-01, API-01, DB-01
    asset_id = Column(String(50), nullable=False)
    event_type = Column(String(50), nullable=False) # HTTP_REQUEST, APPLICATION_ANOMALY, AUTH_EVENT, DB_QUERY
    severity = Column(String(20), default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW, INFO
    actor = Column(String(50), default="TEST_RUNNER")
    source_ip = Column(String(45), default="10.240.0.100")
    destination = Column(String(100), default="10.240.0.10:80")
    action = Column(String(100), nullable=False)
    result = Column(String(50), default="OBSERVED")
    metadata_json = Column(Text, nullable=True)

    run = relationship("ExerciseRun", back_populates="telemetry_records")

class DetectionRule(Base):
    __tablename__ = "detection_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_code = Column(String(50), unique=True, nullable=False, index=True) # RUL-WEB-001
    name = Column(String(150), nullable=False) # Synthetic Insecure API Authorization Anomaly
    description = Column(Text)
    severity = Column(String(20), default="HIGH")
    enabled = Column(Boolean, default=True)
    rule_type = Column(String(50), default="CORRELATION_PATTERN")
    conditions_json = Column(Text, nullable=False)
    technique_id = Column(String(50), default="T1190") # MITRE ATT&CK Technique
    tactic = Column(String(50), default="Initial Access")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), unique=True, nullable=False) # e.g. ALRT-0041
    rule_id = Column(String(36), ForeignKey("detection_rules.id"), nullable=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    asset_id = Column(String(50), nullable=True)
    exercise_run_id = Column(String(36), ForeignKey("exercise_runs.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    severity = Column(String(20), nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    source_ip = Column(String(45))
    asset_name = Column(String(100))
    detection_rule = Column(String(150))
    mitre_technique = Column(String(100))
    confidence = Column(String(20), default="94.7%")
    status = Column(String(30), default="INVESTIGATING") # NEW, ACKNOWLEDGED, INVESTIGATING, RESOLVED
    first_seen = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)
    evidence_count = Column(Integer, default=3)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    run = relationship("ExerciseRun", back_populates="alerts")
    incident = relationship("Incident", back_populates="alerts")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), unique=True, nullable=False) # e.g. INC-0001
    exercise_run_id = Column(String(36), ForeignKey("exercise_runs.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    severity = Column(String(20), nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(30), default="OPEN") # OPEN, TRIAGED, INVESTIGATING, CONTAINED, RESOLVED, CLOSED
    source = Column(String(100), default="CYBERNEXUS DETECTION ENGINE")
    primary_asset = Column(String(100), default="WEB-01")
    asset_name = Column(String(100))
    technique = Column(String(100), default="T1190 - Exploit Public-Facing Application")
    description = Column(Text)
    assigned_to = Column(String(50), default="analyst01")
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    run = relationship("ExerciseRun", back_populates="incidents")
    alerts = relationship("Alert", back_populates="incident")
    evidence_items = relationship("Evidence", back_populates="incident", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="incident", cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=True)
    exercise_run_id = Column(String(36), ForeignKey("exercise_runs.id", ondelete="CASCADE"), nullable=True)
    asset_id = Column(String(100), nullable=False)
    evidence_type = Column(String(50), nullable=False) # LOG, EVENT, NETWORK_METADATA, APPLICATION_EVENT
    source = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    sha256 = Column(String(64), nullable=False)
    integrity_status = Column(String(20), default="VERIFIED") # VERIFIED, FAILED
    collected_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="evidence_items")
    run = relationship("ExerciseRun", back_populates="evidence_records")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    finding_code = Column(String(50), unique=True, nullable=False) # FND-WEB-001
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=True)
    asset_id = Column(String(100), nullable=False) # WEB-01
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    risk_score = Column(Integer, default=82) # 0 to 100
    impact = Column(Text, nullable=False)
    evidence_summary = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    verification_steps = Column(Text, nullable=False)
    status = Column(String(30), default="OPEN") # OPEN, REMEDIATION_REQUIRED, FIXED, RETEST_PENDING, VERIFIED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="findings")
    retests = relationship("Retest", back_populates="finding", cascade="all, delete-orphan")

class Retest(Base):
    __tablename__ = "retests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    finding_id = Column(String(36), ForeignKey("findings.id", ondelete="CASCADE"), nullable=False)
    previous_run_id = Column(String(36), nullable=False)
    new_run_id = Column(String(36), nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)
    result = Column(String(30), default="FIXED") # FIXED, STILL_PRESENT, INCONCLUSIVE
    evidence_summary = Column(Text)
    verified_by = Column(String(50), default="analyst01")

    finding = relationship("Finding", back_populates="retests")

# ============================================================
# MILESTONE 4: AUTHORIZED WEB & API ASSESSMENT ENGINE SCHEMAS
# ============================================================

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, nullable=False, index=True) # ASM-2026-001
    title = Column(String(200), nullable=False)
    description = Column(Text)
    mode = Column(String(30), default="INTERNAL_LAB") # INTERNAL_LAB, EXTERNAL_AUTHORIZED
    target_type = Column(String(30), default="WEB") # WEB, API, LAB_NODE
    target_url = Column(String(255), nullable=False)
    status = Column(String(30), default="READY") # READY, QUEUED, RUNNING, COMPLETED, FAILED, STOPPED
    risk_score = Column(Integer, default=0) # 0 to 100
    request_budget = Column(Integer, default=100)
    requests_used = Column(Integer, default=0)
    max_rate_limit = Column(Integer, default=5) # req/sec
    created_by = Column(String(50), default="analyst01")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    scope = relationship("AssessmentScope", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    runs = relationship("AssessmentRun", back_populates="assessment", cascade="all, delete-orphan")
    assets = relationship("AssessmentAsset", back_populates="assessment", cascade="all, delete-orphan")
    urls = relationship("AssessmentURL", back_populates="assessment", cascade="all, delete-orphan")
    endpoints = relationship("APIEndpoint", back_populates="assessment", cascade="all, delete-orphan")
    findings = relationship("AssessmentFinding", back_populates="assessment", cascade="all, delete-orphan")
    evidence_items = relationship("AssessmentEvidence", back_populates="assessment", cascade="all, delete-orphan")
    logs = relationship("RedactedLog", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentScope(Base):
    __tablename__ = "assessment_scopes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    authorization_granted = Column(Boolean, default=True)
    attestation_code = Column(String(100), default="AUTH-2026-001")
    authorized_by = Column(String(100), default="Chief Security Officer")
    purpose = Column(Text, default="Authorized Security Posture Assessment & Vulnerability Audit")
    allowed_domains = Column(Text, default='[]') # JSON string array
    excluded_hosts = Column(Text, default='[]') # JSON string array
    expiration_date = Column(DateTime, default=lambda: datetime.datetime.utcnow() + datetime.timedelta(days=1))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    assessment = relationship("Assessment", back_populates="scope")

class AssessmentRun(Base):
    __tablename__ = "assessment_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    run_code = Column(String(50), unique=True, nullable=False) # RUN-ASM-2026-001
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(30), default="RUNNING") # RUNNING, COMPLETED, FAILED, STOPPED
    total_checks = Column(Integer, default=0)
    passed_checks = Column(Integer, default=0)
    findings_count = Column(Integer, default=0)
    requests_made = Column(Integer, default=0)

    assessment = relationship("Assessment", back_populates="runs")

class AssessmentAsset(Base):
    __tablename__ = "assessment_assets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    asset_name = Column(String(100), nullable=False)
    host_or_ip = Column(String(100), nullable=False)
    port = Column(Integer, default=80)
    asset_type = Column(String(50), default="WEB SERVER")
    status = Column(String(30), default="ACTIVE")
    response_time_ms = Column(Float, default=0.0)
    tls_status = Column(String(50), default="N/A")
    discovered_at = Column(DateTime, default=datetime.datetime.utcnow)

    assessment = relationship("Assessment", back_populates="assets")
    findings = relationship("AssessmentFinding", back_populates="asset")

class AssessmentURL(Base):
    __tablename__ = "assessment_urls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(255), nullable=False)
    status_code = Column(Integer, default=200)
    content_type = Column(String(100), default="text/html")
    response_time_ms = Column(Float, default=0.0)
    title = Column(String(200), default="Discovered Resource")
    discovered_via = Column(String(50), default="WEB_CRAWLER")

    assessment = relationship("Assessment", back_populates="urls")

class APIEndpoint(Base):
    __tablename__ = "api_endpoints"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    method = Column(String(10), default="GET") # GET, POST, PUT, DELETE, OPTIONS
    path = Column(String(255), nullable=False)
    summary = Column(String(200), default="Discovered API Endpoint")
    auth_required = Column(Boolean, default=False)
    parameters_json = Column(Text, default='[]')
    response_codes_json = Column(Text, default='["200"]')
    discovered_at = Column(DateTime, default=datetime.datetime.utcnow)

    assessment = relationship("Assessment", back_populates="endpoints")

class AssessmentFinding(Base):
    __tablename__ = "assessment_findings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    finding_code = Column(String(50), unique=True, nullable=False, index=True) # FND-ASM-001
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    asset_id = Column(String(36), ForeignKey("assessment_assets.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), default="SECURITY_HEADERS") # TLS, HEADERS, CORS, API_AUTH, ENUMERATION, COOKIES, SENSITIVE_PATH
    severity = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW, INFO
    cvss_score = Column(Float, default=7.5)
    cvss_vector = Column(String(100), default="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N")
    cwe_id = Column(String(50), default="CWE-693")
    risk_score = Column(Integer, default=75) # 0 to 100
    impact = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    remediation_code = Column(Text)
    status = Column(String(30), default="OPEN") # OPEN, REMEDIATED, RETEST_PENDING, VERIFIED_FIXED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    assessment = relationship("Assessment", back_populates="findings")
    asset = relationship("AssessmentAsset", back_populates="findings")
    evidence_items = relationship("AssessmentEvidence", back_populates="finding", cascade="all, delete-orphan")

class AssessmentEvidence(Base):
    __tablename__ = "assessment_evidences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    finding_id = Column(String(36), ForeignKey("assessment_findings.id", ondelete="CASCADE"), nullable=False)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    evidence_type = Column(String(50), default="HTTP_REQ_RES")
    request_method = Column(String(10), default="GET")
    request_url = Column(String(255), nullable=False)
    redacted_request_headers = Column(Text)
    redacted_request_body = Column(Text)
    response_status = Column(Integer, default=200)
    redacted_response_headers = Column(Text)
    redacted_response_body = Column(Text)
    proof_of_concept = Column(Text)
    sha256_hash = Column(String(64), nullable=False)
    collected_at = Column(DateTime, default=datetime.datetime.utcnow)

    assessment = relationship("Assessment", back_populates="evidence_items")
    finding = relationship("AssessmentFinding", back_populates="evidence_items")

class RedactedLog(Base):
    __tablename__ = "redacted_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    level = Column(String(20), default="INFO") # INFO, CHECK, FINDING, REDACTED, WARN, ERROR
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    assessment = relationship("Assessment", back_populates="logs")

# ============================================================
# MILESTONE 5: SOC, THREAT DETECTION, HUNTING & PURPLE TEAM SCHEMAS
# ============================================================

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_code = Column(String(50), unique=True, nullable=False, index=True) # EVT-2026-0001
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    event_type = Column(String(50), nullable=False, index=True) # AUTHENTICATION, AUTH_FAILURE, AUTH_SUCCESS, PROCESS, NETWORK, HTTP, API, SYSTEM, IOC_MATCH
    source_type = Column(String(50), default="RANGE_TELEMETRY") # APPLICATION, FIREWALL, SYSTEM_LOG, WAF, RANGE_TELEMETRY
    source = Column(String(100), nullable=False) # WEB-01, API-01, DB-01, LINUX-01
    asset_id = Column(String(100), nullable=False, index=True)
    asset_hostname = Column(String(100))
    source_ip = Column(String(45), index=True)
    destination_ip = Column(String(45), index=True)
    source_port = Column(Integer, nullable=True)
    destination_port = Column(Integer, nullable=True)
    protocol = Column(String(20), default="TCP")
    user = Column(String(50), index=True)
    process = Column(String(100))
    action = Column(String(100), nullable=False)
    result = Column(String(50), default="SUCCESS")
    severity = Column(String(20), default="INFO", index=True) # INFO, LOW, MEDIUM, HIGH, CRITICAL
    request_id = Column(String(100), index=True)
    session_id = Column(String(100))
    exercise_run_id = Column(String(36), nullable=True)
    assessment_run_id = Column(String(36), nullable=True)
    raw_reference = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    enrichments = relationship("EventEnrichment", back_populates="event", cascade="all, delete-orphan")
    ioc_matches = relationship("IOCMatch", back_populates="event", cascade="all, delete-orphan")
    investigation_links = relationship("InvestigationEvent", back_populates="event", cascade="all, delete-orphan")

class EventEnrichment(Base):
    __tablename__ = "event_enrichments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("security_events.id", ondelete="CASCADE"), nullable=False)
    asset_criticality = Column(String(20), default="HIGH")
    environment = Column(String(50), default="ISOLATED_LAB")
    user_role = Column(String(50), nullable=True)
    matched_ioc_id = Column(String(36), nullable=True)
    mitre_technique = Column(String(50), nullable=True) # T1110, T1078, T1190
    tactic = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("SecurityEvent", back_populates="enrichments")

class CorrelationRule(Base):
    __tablename__ = "correlation_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_code = Column(String(50), unique=True, nullable=False, index=True) # CORR-AUTH-001
    name = Column(String(150), nullable=False)
    description = Column(Text)
    enabled = Column(Boolean, default=True)
    rule_type = Column(String(50), default="THRESHOLD") # THRESHOLD, SEQUENCE, TIME_WINDOW, MULTI_EVENT, ASSET_CORRELATION, USER_CORRELATION
    severity = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    window_seconds = Column(Integer, default=60)
    threshold = Column(Integer, default=5)
    conditions_json = Column(Text, nullable=False)
    technique_id = Column(String(50), default="T1110")
    version = Column(Integer, default=1)
    created_by = Column(String(50), default="analyst01")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    matches = relationship("CorrelationMatch", back_populates="rule", cascade="all, delete-orphan")

class CorrelationMatch(Base):
    __tablename__ = "correlation_matches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    match_code = Column(String(50), unique=True, nullable=False) # MAT-2026-001
    rule_id = Column(String(36), ForeignKey("correlation_rules.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    severity = Column(String(20), default="HIGH")
    asset_id = Column(String(100), nullable=False)
    user = Column(String(50), nullable=True)
    source_ip = Column(String(45), nullable=True)
    event_count = Column(Integer, default=1)
    event_ids_json = Column(Text, nullable=False)
    matched_at = Column(DateTime, default=datetime.datetime.utcnow)

    rule = relationship("CorrelationRule", back_populates="matches")

class IOCRecord(Base):
    __tablename__ = "ioc_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ioc_code = Column(String(50), unique=True, nullable=False) # IOC-001
    type = Column(String(20), nullable=False) # IP, DOMAIN, URL, HASH, FILE, PROCESS
    value = Column(String(255), nullable=False, index=True)
    source = Column(String(100), default="CYBERNEXUS Threat Intelligence")
    confidence = Column(String(20), default="HIGH")
    description = Column(Text)
    mitre_technique = Column(String(50), default="T1071")
    status = Column(String(20), default="ACTIVE") # ACTIVE, EXPIRED, FALSE_POSITIVE, REVOKED
    first_seen = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)

    matches = relationship("IOCMatch", back_populates="ioc", cascade="all, delete-orphan")

class IOCMatch(Base):
    __tablename__ = "ioc_matches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ioc_id = Column(String(36), ForeignKey("ioc_records.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(String(36), ForeignKey("security_events.id", ondelete="CASCADE"), nullable=False)
    matched_value = Column(String(255), nullable=False)
    matched_at = Column(DateTime, default=datetime.datetime.utcnow)

    ioc = relationship("IOCRecord", back_populates="matches")
    event = relationship("SecurityEvent", back_populates="ioc_matches")

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_code = Column(String(50), unique=True, nullable=False, index=True) # INV-2026-001
    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(String(30), default="OPEN") # OPEN, INVESTIGATING, CONTAINED, CLOSED
    priority = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    assigned_to = Column(String(50), default="analyst01")
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    events = relationship("InvestigationEvent", back_populates="investigation", cascade="all, delete-orphan")

class InvestigationEvent(Base):
    __tablename__ = "investigation_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(String(36), ForeignKey("security_events.id", ondelete="CASCADE"), nullable=False)
    added_by = Column(String(50), default="analyst01")
    added_at = Column(DateTime, default=datetime.datetime.utcnow)

    investigation = relationship("Investigation", back_populates="events")
    event = relationship("SecurityEvent", back_populates="investigation_links")

class SavedHunt(Base):
    __tablename__ = "saved_hunts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hunt_code = Column(String(50), unique=True, nullable=False) # HUNT-001
    name = Column(String(150), nullable=False)
    description = Column(Text)
    query_json = Column(Text, nullable=False)
    created_by = Column(String(50), default="analyst01")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DetectionGap(Base):
    __tablename__ = "detection_gaps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    technique_id = Column(String(50), nullable=False, index=True) # T1110
    technique_name = Column(String(150), nullable=False)
    exercise_code = Column(String(50), nullable=False) # EX-001
    expected_detection = Column(String(100), nullable=False)
    actual_detection = Column(String(100), nullable=False)
    reason = Column(Text, nullable=False)
    severity = Column(String(20), default="HIGH")
    recommendation = Column(Text, nullable=False)
    status = Column(String(30), default="OPEN") # OPEN, IN_REVIEW, RESOLVED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AnalystFeedback(Base):
    __tablename__ = "analyst_feedback"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_id = Column(String(36), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False)
    feedback_type = Column(String(30), nullable=False) # TRUE_POSITIVE, FALSE_POSITIVE, SEVERITY_CORRECTION
    reason = Column(Text, nullable=False)
    analyst = Column(String(50), default="analyst01")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ============================================================
# MILESTONE 6: NEXUS AI SECURITY BRAIN SCHEMAS
# ============================================================

class AIInvestigation(Base):
    __tablename__ = "ai_investigations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_code = Column(String(50), unique=True, nullable=False, index=True) # NEXUS-INV-2026-001
    title = Column(String(200), nullable=False)
    description = Column(Text)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(30), default="RUNNING") # PENDING, RUNNING, COMPLETED, FAILED
    trigger_type = Column(String(50), default="MANUAL_ANALYST") # AUTOMATIC_SOC, MANUAL_ANALYST, THREAT_HUNT
    model_used = Column(String(100), default="CYBERNEXUS-Security-LLM-v1")
    summary = Column(Text, nullable=True)
    conclusion = Column(Text, nullable=True)
    confidence_score = Column(Float, default=92.5)
    created_by = Column(String(50), default="analyst01")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    agent_runs = relationship("AIAgentRun", back_populates="investigation", cascade="all, delete-orphan")
    evidence_links = relationship("AIEvidenceLink", back_populates="investigation", cascade="all, delete-orphan")
    hypotheses = relationship("AIHypothesis", back_populates="investigation", cascade="all, delete-orphan")
    recommendations = relationship("AIRecommendation", back_populates="investigation", cascade="all, delete-orphan")
    attack_paths = relationship("AIAttackPath", back_populates="investigation", cascade="all, delete-orphan")
    risk_assessments = relationship("AIRiskAssessment", back_populates="investigation", cascade="all, delete-orphan")
    response_plans = relationship("AIResponsePlan", back_populates="investigation", cascade="all, delete-orphan")
    evaluations = relationship("AIEvaluation", back_populates="investigation", cascade="all, delete-orphan")

class AIAgentRun(Base):
    __tablename__ = "ai_agent_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("ai_investigations.id", ondelete="CASCADE"), nullable=False)
    agent_name = Column(String(50), nullable=False) # SOC_AGENT, FORENSIC_AGENT, THREAT_INTEL_AGENT, RISK_AGENT, RESPONSE_AGENT, REPORTING_AGENT
    status = Column(String(30), default="SUCCESS") # STARTED, RUNNING, SUCCESS, FAILED
    input_summary = Column(Text, nullable=True)
    output_summary = Column(Text, nullable=True)
    tokens_used = Column(Integer, default=1500)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    investigation = relationship("AIInvestigation", back_populates="agent_runs")

class AIEvidenceLink(Base):
    __tablename__ = "ai_evidence_links"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("ai_investigations.id", ondelete="CASCADE"), nullable=False)
    evidence_type = Column(String(50), nullable=False) # EVENT, ALERT, INCIDENT, FINDING, PCAP, LOG
    evidence_id = Column(String(36), nullable=False)
    evidence_code = Column(String(50), nullable=False) # EVT-102, ALRT-0041, INC-0001, FND-001
    relevance_score = Column(Float, default=0.95)
    citation_text = Column(Text, nullable=False)

    investigation = relationship("AIInvestigation", back_populates="evidence_links")

class AIHypothesis(Base):
    __tablename__ = "ai_hypotheses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("ai_investigations.id", ondelete="CASCADE"), nullable=False)
    hypothesis_code = Column(String(50), nullable=False) # HYP-001
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    confidence_level = Column(String(20), default="HIGH") # HIGH, MEDIUM, LOW
    mitre_technique = Column(String(50), default="T1059.001")
    supporting_evidence_codes_json = Column(Text, default='[]')
    status = Column(String(30), default="VALIDATED") # VALIDATED, REFUTED, UNVERIFIED

    investigation = relationship("AIInvestigation", back_populates="hypotheses")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("ai_investigations.id", ondelete="CASCADE"), nullable=False)
    recommendation_code = Column(String(50), nullable=False) # REC-001
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    action_type = Column(String(50), default="CONTAINMENT") # CONTAINMENT, REMEDIATION, HUNT, RULE_UPDATE
    priority = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    risk_impact = Column(Text, nullable=True)
    evidence_citations_json = Column(Text, default='[]')

    investigation = relationship("AIInvestigation", back_populates="recommendations")

class AIAttackPath(Base):
    __tablename__ = "ai_attack_paths"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("ai_investigations.id", ondelete="CASCADE"), nullable=False)
    path_code = Column(String(50), nullable=False) # AP-001
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_node = Column(String(100), default="EXTERNAL_ATTACKER")
    target_node = Column(String(100), default="DB-01 (Database)")
    total_steps = Column(Integer, default=3)
    risk_score = Column(Float, default=88.5)

    investigation = relationship("AIInvestigation", back_populates="attack_paths")
    edges = relationship("AIAttackPathEdge", back_populates="attack_path", cascade="all, delete-orphan")

class AIAttackPathEdge(Base):
    __tablename__ = "ai_attack_path_edges"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attack_path_id = Column(String(36), ForeignKey("ai_attack_paths.id", ondelete="CASCADE"), nullable=False)
    step_number = Column(Integer, nullable=False)
    source_asset_name = Column(String(100), nullable=False)
    target_asset_name = Column(String(100), nullable=False)
    action_taken = Column(String(200), nullable=False)
    technique_id = Column(String(50), default="T1059")
    technique_name = Column(String(150), default="Command Execution")
    evidence_code = Column(String(50), default="EVT-101")
    confidence = Column(Float, default=0.9)

    attack_path = relationship("AIAttackPath", back_populates="edges")

class AIRiskAssessment(Base):
    __tablename__ = "ai_risk_assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("ai_investigations.id", ondelete="CASCADE"), nullable=False)
    cvss_score = Column(Float, default=8.8)
    business_impact_score = Column(Float, default=9.0)
    overall_risk_score = Column(Float, default=89.0)
    severity = Column(String(20), default="CRITICAL") # CRITICAL, HIGH, MEDIUM, LOW
    exposure_vector = Column(String(100), default="NETWORK_EXPOSED_API")
    affected_assets_json = Column(Text, default='[]')
    explaining_factors_json = Column(Text, default='[]')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    investigation = relationship("AIInvestigation", back_populates="risk_assessments")

class AIResponsePlan(Base):
    __tablename__ = "ai_response_plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("ai_investigations.id", ondelete="CASCADE"), nullable=False)
    plan_code = Column(String(50), nullable=False) # RESP-001
    title = Column(String(200), nullable=False)
    status = Column(String(30), default="PROPOSED") # PROPOSED, APPROVED, EXECUTED, REJECTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    investigation = relationship("AIInvestigation", back_populates="response_plans")
    actions = relationship("AIResponseAction", back_populates="response_plan", cascade="all, delete-orphan")

class AIResponseAction(Base):
    __tablename__ = "ai_response_actions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    response_plan_id = Column(String(36), ForeignKey("ai_response_plans.id", ondelete="CASCADE"), nullable=False)
    action_code = Column(String(50), nullable=False) # ACT-001
    target_asset_name = Column(String(100), nullable=False) # CONTAINER-01
    target_ip = Column(String(45), default="10.240.0.15")
    action_type = Column(String(50), nullable=False) # ISOLATE_CONTAINER, REVOKE_TOKEN, BLOCK_IP, RESTART_SERVICE
    command_to_execute = Column(Text, nullable=False)
    risk_level = Column(String(20), default="HIGH") # HIGH, MEDIUM, LOW
    is_lab_contained = Column(Boolean, default=True)
    status = Column(String(30), default="PENDING_APPROVAL") # PENDING_APPROVAL, APPROVED, REJECTED, EXECUTED, FAILED
    execution_result_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    response_plan = relationship("AIResponsePlan", back_populates="actions")
    approval = relationship("AIResponseApproval", back_populates="action", uselist=False, cascade="all, delete-orphan")

class AIResponseApproval(Base):
    __tablename__ = "ai_response_approvals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    action_id = Column(String(36), ForeignKey("ai_response_actions.id", ondelete="CASCADE"), nullable=False)
    approver_username = Column(String(50), nullable=False)
    approval_status = Column(String(20), nullable=False) # APPROVED, REJECTED
    rejection_reason = Column(Text, nullable=True)
    decided_at = Column(DateTime, default=datetime.datetime.utcnow)

    action = relationship("AIResponseAction", back_populates="approval")

class AICaseMemory(Base):
    __tablename__ = "ai_case_memories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), nullable=False, index=True)
    memory_key = Column(String(100), nullable=False)
    memory_value_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RAGDocument(Base):
    __tablename__ = "rag_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_code = Column(String(50), unique=True, nullable=False) # DOC-THREAT-001
    title = Column(String(200), nullable=False)
    doc_type = Column(String(50), default="THREAT_INTEL") # THREAT_INTEL, MITRE_KB, INCIDENT_PLAYBOOK, SECURITY_POLICY
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    chunks = relationship("RAGChunk", back_populates="document", cascade="all, delete-orphan")

class RAGChunk(Base):
    __tablename__ = "rag_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("rag_documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding_vector_json = Column(Text, nullable=True)
    keywords_json = Column(Text, default='[]')

    document = relationship("RAGDocument", back_populates="chunks")

class AIEvaluation(Base):
    __tablename__ = "ai_evaluations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("ai_investigations.id", ondelete="CASCADE"), nullable=False)
    groundedness_score = Column(Float, default=98.0)
    hallucination_rate = Column(Float, default=0.0)
    citation_precision = Column(Float, default=100.0)
    is_passed = Column(Boolean, default=True)
    notes = Column(Text, default="All claims backed by database evidence references.")

    investigation = relationship("AIInvestigation", back_populates="evaluations")

# ============================================================
# MILESTONE 7: AUTONOMOUS RESPONSE + PURPLE TEAM MODELS
# ============================================================

class PurpleTeamExercise(Base):
    __tablename__ = "purple_team_exercises"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exercise_code = Column(String(50), unique=True, nullable=False, index=True) # PT-EX-2026-001
    name = Column(String(200), nullable=False)
    description = Column(Text)
    objective = Column(Text)
    environment = Column(String(50), default="CYBERNEXUS_LAB")
    asset_ids_json = Column(Text, default='[]') # ["API-01", "WEB-01"]
    technique_ids_json = Column(Text, default='[]') # ["T1190", "T1059.001"]
    expected_events_json = Column(Text, default='[]')
    expected_detection_rules_json = Column(Text, default='[]')
    expected_alerts_json = Column(Text, default='[]')
    expected_mitre_techniques_json = Column(Text, default='[]')
    risk_level = Column(String(20), default="HIGH")
    authorization_scope = Column(String(100), default="10.240.0.0/16")
    status = Column(String(30), default="READY") # DRAFT, READY, RUNNING, COMPLETED, FAILED, CANCELLED
    created_by = Column(String(50), default="analyst01")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    runs = relationship("PurpleExerciseRun", back_populates="exercise", cascade="all, delete-orphan")

class PurpleExerciseRun(Base):
    __tablename__ = "purple_exercise_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_code = Column(String(50), unique=True, nullable=False, index=True) # PT-RUN-2026-001
    exercise_id = Column(String(36), ForeignKey("purple_team_exercises.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(30), default="COMPLETED") # RUNNING, COMPLETED, FAILED
    operator_id = Column(String(50), default="analyst01")
    lab_id = Column(String(100), default="nexora-cyber-range")
    target_assets_json = Column(Text, default='[]')
    events_generated = Column(Integer, default=0)
    alerts_generated = Column(Integer, default=0)
    detections_triggered = Column(Integer, default=0)
    incident_id = Column(String(36), nullable=True)
    risk_before = Column(Float, default=89.2)
    risk_after = Column(Float, default=34.5)
    coverage_result = Column(String(20), default="PASS") # PASS, PARTIAL, GAP
    purple_score = Column(Float, default=92.0)
    evidence_ids_json = Column(Text, default='[]')
    audit_id = Column(String(36), nullable=True)

    exercise = relationship("PurpleTeamExercise", back_populates="runs")
    retest_runs = relationship("RetestRun", back_populates="purple_run", cascade="all, delete-orphan")

class SecurityControl(Base):
    __tablename__ = "security_controls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    control_code = Column(String(50), unique=True, nullable=False, index=True) # CTRL-AUTH-001
    name = Column(String(200), nullable=False)
    category = Column(String(50), default="DETECTIVE") # PREVENTIVE, DETECTIVE, CORRECTIVE, COMPENSATING
    description = Column(Text)
    asset_scope = Column(String(100), default="API-01, WEB-01, CONTAINER-01")
    control_type = Column(String(50), default="AUTHENTICATION_RATE_LIMIT")
    owner = Column(String(50), default="analyst01")
    status = Column(String(30), default="ACTIVE") # ACTIVE, INACTIVE, DEGRADED
    effectiveness = Column(Float, default=95.0)
    last_tested = Column(DateTime, default=datetime.datetime.utcnow)
    next_test = Column(DateTime, default=lambda: datetime.datetime.utcnow() + datetime.timedelta(days=7))
    evidence_ids_json = Column(Text, default='[]')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ResponseVerification(Base):
    __tablename__ = "response_verifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    action_id = Column(String(36), ForeignKey("ai_response_actions.id", ondelete="CASCADE"), nullable=False)
    verification_code = Column(String(50), unique=True, nullable=False)
    status = Column(String(30), default="VERIFIED") # VERIFIED, FAILED, PENDING
    verification_details_json = Column(Text, nullable=False)
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)
    verified_by = Column(String(50), default="SYSTEM_AUTOMATED_VERIFIER")

class RollbackActionRecord(Base):
    __tablename__ = "rollback_action_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    action_id = Column(String(36), ForeignKey("ai_response_actions.id", ondelete="CASCADE"), nullable=False)
    previous_state = Column(String(50), nullable=False)
    new_state = Column(String(50), nullable=False)
    rollback_command = Column(Text, nullable=False)
    rollback_status = Column(String(30), default="EXECUTED") # PENDING, EXECUTED, FAILED
    performed_by = Column(String(50), default="analyst01")
    performed_at = Column(DateTime, default=datetime.datetime.utcnow)

class RetestRun(Base):
    __tablename__ = "retest_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    retest_code = Column(String(50), unique=True, nullable=False, index=True) # RETEST-2026-001
    original_exercise_id = Column(String(36), ForeignKey("purple_team_exercises.id", ondelete="CASCADE"), nullable=False)
    purple_run_id = Column(String(36), ForeignKey("purple_exercise_runs.id", ondelete="CASCADE"), nullable=False)
    incident_id = Column(String(36), nullable=True)
    action_id = Column(String(36), nullable=True)
    status = Column(String(30), default="COMPLETED") # RUNNING, COMPLETED, FAILED
    risk_before = Column(Float, default=89.2)
    risk_after = Column(Float, default=34.5)
    risk_reduction_percentage = Column(Float, default=61.3)
    detection_before = Column(String(20), default="GAP")
    detection_after = Column(String(20), default="PASS")
    final_status = Column(String(30), default="RISK_REDUCED_CONTROL_VALIDATED")
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)

    purple_run = relationship("PurpleExerciseRun", back_populates="retest_runs")

class DetectionGapRecord(Base):
    __tablename__ = "detection_gap_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    gap_code = Column(String(50), unique=True, nullable=False, index=True) # GAP-2026-001
    exercise_id = Column(String(36), ForeignKey("purple_team_exercises.id", ondelete="CASCADE"), nullable=False)
    technique_id = Column(String(50), nullable=False) # T1190
    expected_detection = Column(String(100), nullable=False)
    actual_detection = Column(String(100), default="NONE_DETECTED")
    gap_type = Column(String(50), default="DETECTION_GAP") # TELEMETRY_GAP, DETECTION_GAP, CORRELATION_GAP, MITRE_MAPPING_GAP
    severity = Column(String(20), default="HIGH")
    asset_id = Column(String(100), default="API-01")
    evidence_ids_json = Column(Text, default='[]')
    status = Column(String(30), default="OPEN") # OPEN, IN_REVIEW, RESOLVED
    owner = Column(String(50), default="analyst01")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class DetectionRuleVersion(Base):
    __tablename__ = "detection_rule_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_id = Column(String(36), nullable=False, index=True)
    version = Column(Integer, default=1)
    logic = Column(Text, nullable=False)
    author = Column(String(50), default="analyst01")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    approved_by = Column(String(50), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    status = Column(String(30), default="ACTIVE") # DRAFT, TESTING, APPROVED, ACTIVE, RETIRED
    test_result = Column(String(30), default="PASS")
    parent_version_id = Column(String(36), nullable=True)

class SecurityPostureSnapshot(Base):
    __tablename__ = "security_posture_snapshots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    overall_score = Column(Float, default=78.0)
    asset_security_score = Column(Float, default=82.0)
    vulnerability_score = Column(Float, default=71.0)
    snapshot_at = Column(DateTime, default=datetime.datetime.utcnow)

# ============================================================
# MILESTONE 8: CONTINUOUS CYBER RISK INTELLIGENCE SCHEMAS
# ============================================================

class ThreatIntelFeedItem(Base):
    __tablename__ = "threat_intel_feed_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    threat_code = Column(String(50), unique=True, nullable=False, index=True) # TI-2026-001
    threat_actor = Column(String(100), default="APT29 / ShadowWeb")
    malware_family = Column(String(100), default="NexoraSQLInjector")
    cve_id = Column(String(50), default="CVE-2026-8812")
    description = Column(Text)
    mitre_technique = Column(String(50), default="T1190")
    severity = Column(String(20), default="CRITICAL")
    target_sectors_json = Column(Text, default='["FINANCIAL", "ENTERPRISE", "E-COMMERCE"]')
    published_at = Column(DateTime, default=datetime.datetime.utcnow)

class KnowledgeGraphNode(Base):
    __tablename__ = "knowledge_graph_nodes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    node_key = Column(String(100), unique=True, nullable=False, index=True) # ASSET:API-01, VULN:CVE-2026-8812
    label = Column(String(150), nullable=False)
    node_type = Column(String(50), nullable=False) # ASSET, VULNERABILITY, THREAT_ACTOR, CONTROL, TECHNIQUE, SERVICE
    properties_json = Column(Text, default='{}')
    risk_weight = Column(Float, default=5.0)

class KnowledgeGraphEdge(Base):
    __tablename__ = "knowledge_graph_edges"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_node_key = Column(String(100), ForeignKey("knowledge_graph_nodes.node_key", ondelete="CASCADE"), nullable=False)
    target_node_key = Column(String(100), ForeignKey("knowledge_graph_nodes.node_key", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(50), nullable=False) # EXPOSES, HAS_VULNERABILITY, EXPLOITS, PROTECTS, TARGETS
    weight = Column(Float, default=1.0)
    evidence_citation = Column(String(50), default="EVT-102")

class AttackPathIntelligence(Base):
    __tablename__ = "attack_path_intelligence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    path_code = Column(String(50), unique=True, nullable=False, index=True) # PATH-2026-001
    title = Column(String(200), nullable=False)
    entry_point = Column(String(100), default="WEB-01 (External Web Application)")
    target_asset = Column(String(100), default="DB-01 (Production Database)")
    choke_point_asset = Column(String(100), default="API-01 (Gateway)")
    total_hops = Column(Integer, default=3)
    path_risk_score = Column(Float, default=91.4)
    exploitability_rating = Column(String(20), default="HIGH")
    mitigating_control_code = Column(String(50), default="CTRL-AUTH-001")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RiskPrioritizationItem(Base):
    __tablename__ = "risk_prioritization_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    action_code = Column(String(50), unique=True, nullable=False, index=True) # ACT-P0-001
    priority = Column(String(10), nullable=False) # P0, P1, P2, P3
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    affected_asset = Column(String(100), nullable=False)
    cve_or_technique = Column(String(100), default="T1190 / CVE-2026-8812")
    business_impact = Column(Text, nullable=False)
    effort_estimate = Column(String(20), default="LOW (1-2 HOURS)")
    status = Column(String(30), default="OPEN") # OPEN, IN_PROGRESS, RESOLVED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class StrategicAdvisorRecommendation(Base):
    __tablename__ = "strategic_advisor_recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_code = Column(String(50), unique=True, nullable=False) # SAR-2026-001
    executive_summary = Column(Text, nullable=False)
    business_risk_translation = Column(Text, nullable=False)
    recommended_control = Column(String(200), nullable=False)
    projected_risk_reduction = Column(Float, default=45.2)
    confidence_rating = Column(Float, default=95.0)
    evidence_citations_json = Column(Text, default='["EVT-102", "CVE-2026-8812", "PATH-2026-001"]')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)





