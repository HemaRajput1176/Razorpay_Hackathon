import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.schemas import IOCRecord, IOCMatch, SecurityEvent

DEFAULT_IOC_RECORDS = [
    {
        "type": "IP",
        "value": "192.168.1.45",
        "source": "CYBERNEXUS Threat Intel Feed - Known Brute-Force Actor",
        "confidence": "HIGH",
        "description": "Observed in multiple credential stuffing campaigns targeting enterprise endpoints.",
        "mitre_technique": "T1110"
    },
    {
        "type": "IP",
        "value": "10.0.0.99",
        "source": "Internal Cyber Range Threat Feed",
        "confidence": "MEDIUM",
        "description": "Suspicious internal scanner endpoint observed probing sensitive DB ports.",
        "mitre_technique": "T1046"
    },
    {
        "type": "DOMAIN",
        "value": "c2-command.nexora.lab",
        "source": "CYBERNEXUS Domain Reputation Feed",
        "confidence": "HIGH",
        "description": "Known synthetic C2 callback domain.",
        "mitre_technique": "T1071"
    }
]

class IOCEngine:

    def seed_initial_iocs_if_missing(self, db: Session):
        if db.query(IOCRecord).count() == 0:
            for rec in DEFAULT_IOC_RECORDS:
                ioc_code = f"IOC-{uuid.uuid4().hex[:6].upper()}"
                ioc = IOCRecord(
                    ioc_code=ioc_code,
                    type=rec["type"],
                    value=rec["value"],
                    source=rec["source"],
                    confidence=rec["confidence"],
                    description=rec["description"],
                    mitre_technique=rec["mitre_technique"],
                    status="ACTIVE",
                    first_seen=datetime.datetime.utcnow(),
                    last_seen=datetime.datetime.utcnow()
                )
                db.add(ioc)
            db.commit()

    def check_event_for_ioc_match(self, db: Session, event: SecurityEvent) -> Optional[IOCRecord]:
        """
        Extracts IP, Domain, User from event and matches against active IOC records.
        """
        values_to_check = [v for v in [event.source_ip, event.destination_ip, event.user] if v]
        if not values_to_check:
            return None

        matched_ioc = db.query(IOCRecord).filter(
            IOCRecord.value.in_(values_to_check),
            IOCRecord.status == "ACTIVE"
        ).first()

        if matched_ioc:
            # Create match record
            match = IOCMatch(
                ioc_id=matched_ioc.id,
                event_id=event.id,
                matched_value=matched_ioc.value
            )
            db.add(match)
            matched_ioc.last_seen = datetime.datetime.utcnow()
            db.commit()

        return matched_ioc

ioc_engine = IOCEngine()
