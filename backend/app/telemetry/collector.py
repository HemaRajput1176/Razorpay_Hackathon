import uuid
import datetime
import json
from sqlalchemy.orm import Session
from app.models.schemas import TelemetryEvent

class TelemetryCollector:
    """
    Real-Time Telemetry Collector & Event Normalizer for CYBERNEXUS.
    Captures raw HTTP, API, Database, and System events from Cyber Range assets,
    normalizes them into structured telemetry schema, and assigns correlation IDs.
    """

    def capture_and_normalize_event(
        self,
        db: Session,
        request_id: str,
        source: str,
        asset_id: str,
        event_type: str,
        action: str,
        severity: str = "MEDIUM",
        actor: str = "TEST_RUNNER",
        source_ip: str = "10.240.0.100",
        destination: str = "10.240.0.10:80",
        result: str = "OBSERVED",
        metadata: dict = None,
        exercise_run_id: str = None
    ) -> TelemetryEvent:
        event = TelemetryEvent(
            exercise_run_id=exercise_run_id,
            request_id=request_id,
            timestamp=datetime.datetime.utcnow(),
            source=source,
            asset_id=asset_id,
            event_type=event_type,
            severity=severity,
            actor=actor,
            source_ip=source_ip,
            destination=destination,
            action=action,
            result=result,
            metadata_json=json.dumps(metadata or {})
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

telemetry_collector = TelemetryCollector()
