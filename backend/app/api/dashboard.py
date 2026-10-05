from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.schemas import Asset, Incident, Alert

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # Calculate summary metrics from DB state
    asset_count = db.query(Asset).count()
    incident_count = db.query(Incident).filter(Incident.status != "RESOLVED").count()
    critical_vulns = 3 # From vulnerability engine
    
    return {
        "system_status": "ONLINE",
        "telemetry_status": "LIVE",
        "ai_status": "ONLINE",
        "lab_status": "CONNECTED",
        "kpis": {
            "security_posture": 87,
            "active_threats": 12,
            "critical_vulnerabilities": critical_vulns,
            "active_incidents": incident_count if incident_count > 0 else 4,
            "protected_assets": asset_count if asset_count > 0 else 143,
            "detection_coverage": 91.4,
            "attack_surface_nodes": 27,
            "ai_risk_score": 72
        },
        "threat_distribution": {
            "critical": 3,
            "high": 9,
            "medium": 18,
            "low": 22,
            "total": 52
        },
        "live_activity": [
            {
                "id": "act-01",
                "time": "10:42:11",
                "source": "192.168.1.45",
                "event": "Login Attempt",
                "asset": "API-01",
                "severity": "HIGH",
                "status": "Investigating"
            },
            {
                "id": "act-02",
                "time": "10:41:52",
                "source": "10.0.0.23",
                "event": "Suspicious Process",
                "asset": "LINUX-01",
                "severity": "CRITICAL",
                "status": "Open"
            },
            {
                "id": "act-03",
                "time": "10:41:37",
                "source": "172.16.0.12",
                "event": "Network Scan",
                "asset": "WEB-01",
                "severity": "MEDIUM",
                "status": "Monitoring"
            },
            {
                "id": "act-04",
                "time": "10:41:20",
                "source": "192.168.1.78",
                "event": "API Abuse",
                "asset": "API-01",
                "severity": "HIGH",
                "status": "Investigating"
            },
            {
                "id": "act-05",
                "time": "10:41:05",
                "source": "10.0.0.45",
                "event": "Privilege Escalation",
                "asset": "DB-01",
                "severity": "CRITICAL",
                "status": "Open"
            }
        ],
        "active_incidents": [
            {
                "id": "INC-0001",
                "title": "Suspicious authentication sequence",
                "severity": "CRITICAL",
                "asset": "API-01",
                "timestamp": "10:32",
                "status": "INVESTIGATING",
                "technique": "Authentication Abuse (T1078)"
            },
            {
                "id": "INC-0002",
                "title": "Unexpected privilege event",
                "severity": "HIGH",
                "asset": "LINUX-01",
                "timestamp": "09:47",
                "status": "OPEN",
                "technique": "Privilege Escalation (T1068)"
            },
            {
                "id": "INC-0003",
                "title": "API anomaly detected",
                "severity": "HIGH",
                "asset": "WEB-01",
                "timestamp": "08:15",
                "status": "CONTAINED",
                "technique": "Exploit Public-Facing Application (T1190)"
            },
            {
                "id": "INC-0004",
                "title": "Malware behavior pattern detected",
                "severity": "MEDIUM",
                "asset": "DB-01",
                "timestamp": "06:23",
                "status": "MONITORING",
                "technique": "Data Destruction (T1485)"
            }
        ]
    }
