import datetime
import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.schemas import SecurityEvent, EventEnrichment, IOCRecord, IOCMatch
from app.soc.normalizer.schemas import NormalizedEventData
from app.soc.normalizer.validators import validate_raw_event
from app.soc.normalizer.parsers import parse_telemetry

class EventNormalizerPipeline:

    def process_raw_event(self, db: Session, raw_event: Dict[str, Any]) -> Optional[SecurityEvent]:
        """
        Full Pipeline: VALIDATE -> PARSE -> NORMALIZE -> ENRICH -> DEDUPLICATE -> STORE
        """
        # Step 1: Validate
        valid, msg = validate_raw_event(raw_event)
        if not valid:
            return None

        # Step 2 & 3: Parse & Normalize
        norm = parse_telemetry(raw_event)

        # Step 4: Enrich (IOC Match lookup)
        if norm.source_ip:
            ioc = db.query(IOCRecord).filter(
                IOCRecord.value == norm.source_ip,
                IOCRecord.status == "ACTIVE"
            ).first()
            if ioc:
                norm.matched_ioc_id = ioc.id
                norm.severity = "HIGH" if norm.severity in ["INFO", "LOW"] else norm.severity
                norm.mitre_technique = ioc.mitre_technique or norm.mitre_technique

        # Step 5: Deduplicate check (10-second window for exact match)
        window_start = norm.timestamp - datetime.timedelta(seconds=10)
        dup = db.query(SecurityEvent).filter(
            SecurityEvent.asset_id == norm.asset_id,
            SecurityEvent.event_type == norm.event_type,
            SecurityEvent.action == norm.action,
            SecurityEvent.source_ip == norm.source_ip,
            SecurityEvent.timestamp >= window_start
        ).first()

        if dup and norm.request_id and dup.request_id == norm.request_id:
            # Skip storing exact duplicate within 10s
            return dup

        # Step 6: Store Event
        evt = SecurityEvent(
            event_code=norm.event_code,
            timestamp=norm.timestamp,
            event_type=norm.event_type,
            source_type=norm.source_type,
            source=norm.source,
            asset_id=norm.asset_id,
            asset_hostname=norm.asset_hostname,
            source_ip=norm.source_ip,
            destination_ip=norm.destination_ip,
            source_port=norm.source_port,
            destination_port=norm.destination_port,
            protocol=norm.protocol,
            user=norm.user,
            process=norm.process,
            action=norm.action,
            result=norm.result,
            severity=norm.severity,
            request_id=norm.request_id,
            session_id=norm.session_id,
            exercise_run_id=norm.exercise_run_id,
            assessment_run_id=norm.assessment_run_id,
            raw_reference=norm.raw_reference,
            metadata_json=norm.metadata_json
        )
        db.add(evt)
        db.flush()

        enrichment = EventEnrichment(
            event_id=evt.id,
            asset_criticality=norm.asset_criticality,
            environment=norm.environment,
            user_role="ADMIN" if norm.user in ["admin", "root", "analyst01"] else "USER",
            matched_ioc_id=norm.matched_ioc_id,
            mitre_technique=norm.mitre_technique,
            tactic="Initial Access" if norm.mitre_technique in ["T1110", "T1190"] else "Credential Access"
        )
        db.add(enrichment)

        # Record IOC Match if enriched
        if norm.matched_ioc_id:
            ioc_match = IOCMatch(
                ioc_id=norm.matched_ioc_id,
                event_id=evt.id,
                matched_value=norm.source_ip
            )
            db.add(ioc_match)

        db.commit()
        return evt

normalizer_pipeline = EventNormalizerPipeline()
