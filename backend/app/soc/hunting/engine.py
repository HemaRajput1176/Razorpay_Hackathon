import uuid
import json
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.schemas import (
    SecurityEvent, EventEnrichment, SavedHunt, Investigation, InvestigationEvent, Incident, Alert, Evidence
)

class ThreatHuntingEngine:

    def execute_hunt_query(self, db: Session, filters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes safe structured Threat Hunt query over security_events.
        NO raw SQL text input is evaluated.
        """
        query = db.query(SecurityEvent)

        # Time range filter
        time_range = filters.get("time_range") or "15M"
        now = datetime.datetime.utcnow()
        if time_range == "15M":
            query = query.filter(SecurityEvent.timestamp >= now - datetime.timedelta(minutes=15))
        elif time_range == "1H":
            query = query.filter(SecurityEvent.timestamp >= now - datetime.timedelta(hours=1))
        elif time_range == "24H":
            query = query.filter(SecurityEvent.timestamp >= now - datetime.timedelta(hours=24))
        elif time_range == "7D":
            query = query.filter(SecurityEvent.timestamp >= now - datetime.timedelta(days=7))

        # Field filters
        if filters.get("event_type"):
            query = query.filter(SecurityEvent.event_type == filters["event_type"])
        if filters.get("asset_id"):
            query = query.filter(SecurityEvent.asset_id == filters["asset_id"])
        if filters.get("user"):
            query = query.filter(SecurityEvent.user == filters["user"])
        if filters.get("source_ip"):
            query = query.filter(SecurityEvent.source_ip == filters["source_ip"])
        if filters.get("destination_ip"):
            query = query.filter(SecurityEvent.destination_ip == filters["destination_ip"])
        if filters.get("severity"):
            query = query.filter(SecurityEvent.severity == filters["severity"])
        if filters.get("action"):
            query = query.filter(SecurityEvent.action.ilike(f"%{filters['action']}%"))
        if filters.get("request_id"):
            query = query.filter(SecurityEvent.request_id == filters["request_id"])

        events = query.order_by(SecurityEvent.timestamp.desc()).limit(200).all()

        # Compute Hunt Summary Metrics
        assets_found = list(set([e.source for e in events if e.source]))
        users_found = list(set([e.user for e in events if e.user]))
        ips_found = list(set([e.source_ip for e in events if e.source_ip]))
        event_ids = [e.id for e in events]

        # Related Alerts & Incidents
        related_alerts_count = db.query(Alert).filter(Alert.asset_id.in_(assets_found)).count() if assets_found else 0
        related_incidents_count = db.query(Incident).filter(Incident.primary_asset.in_(assets_found)).count() if assets_found else 0

        event_items = []
        for e in events:
            enr = db.query(EventEnrichment).filter(EventEnrichment.event_id == e.id).first()
            event_items.append({
                "id": e.id,
                "event_code": e.event_code,
                "timestamp": e.timestamp.isoformat() if e.timestamp else None,
                "event_type": e.event_type,
                "source": e.source,
                "asset_id": e.asset_id,
                "source_ip": e.source_ip,
                "destination_ip": e.destination_ip,
                "user": e.user,
                "action": e.action,
                "result": e.result,
                "severity": e.severity,
                "request_id": e.request_id,
                "mitre_technique": enr.mitre_technique if enr else None
            })

        return {
            "summary": {
                "events_found": len(event_items),
                "unique_assets": assets_found,
                "unique_users": users_found,
                "unique_source_ips": ips_found,
                "related_alerts": related_alerts_count,
                "related_incidents": related_incidents_count
            },
            "events": event_items
        }

    def save_hunt(self, db: Session, name: str, description: str, query_dict: Dict[str, Any], created_by: str = "analyst01") -> SavedHunt:
        hunt_code = f"HUNT-{uuid.uuid4().hex[:6].upper()}"
        hunt = SavedHunt(
            hunt_code=hunt_code,
            name=name,
            description=description,
            query_json=json.dumps(query_dict),
            created_by=created_by
        )
        db.add(hunt)
        db.commit()
        return hunt

    def convert_hunt_to_investigation(self, db: Session, title: str, description: str, event_ids: List[str], created_by: str = "analyst01") -> Investigation:
        inv_code = f"INV-2026-{uuid.uuid4().hex[:6].upper()}"
        investigation = Investigation(
            investigation_code=inv_code,
            title=title,
            description=description,
            status="OPEN",
            priority="HIGH",
            assigned_to=created_by
        )
        db.add(investigation)
        db.flush()

        for eid in event_ids:
            inv_evt = InvestigationEvent(
                investigation_id=investigation.id,
                event_id=eid,
                added_by=created_by
            )
            db.add(inv_evt)

        db.commit()
        return investigation

threat_hunting_engine = ThreatHuntingEngine()
