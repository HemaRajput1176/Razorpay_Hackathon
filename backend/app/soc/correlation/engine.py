import uuid
import json
import datetime
import hashlib
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.schemas import (
    SecurityEvent, CorrelationRule, CorrelationMatch, Alert, Incident, Evidence
)
from app.soc.correlation.state import window_state_manager

class CorrelationEngine:

    def evaluate_event(self, db: Session, event: SecurityEvent) -> Dict[str, Any]:
        """
        Evaluates incoming security event against correlation rules.
        Generates CorrelationMatches, Alerts, and auto-creates Incidents.
        """
        rules = db.query(CorrelationRule).filter(CorrelationRule.enabled == True).all()
        generated_alerts = []
        generated_incidents = []

        now = event.timestamp or datetime.datetime.utcnow()

        for rule in rules:
            key = f"{rule.id}:{event.asset_id}:{event.source_ip or 'unknown'}"

            # Step 1: Push event to sliding window buffer
            window_state_manager.push_event(key, event.id, now, event.event_type)

            # Step 2: Clean expired events outside rule window
            active_events = window_state_manager.clean_expired(key, rule.window_seconds, now)

            # Step 3: Rule Logic Evaluation
            match_triggered = False

            if rule.rule_type == "THRESHOLD":
                # Count matching event types
                conds = json.loads(rule.conditions_json or "{}")
                target_type = conds.get("event_type")
                matching = [item for item in active_events if not target_type or item[2] == target_type]
                if len(matching) >= rule.threshold:
                    match_triggered = True

            elif rule.rule_type == "SEQUENCE":
                conds = json.loads(rule.conditions_json or "{}")
                seq = conds.get("sequence", [])
                types_in_buffer = [item[2] for item in active_events]
                if len(seq) == 2 and seq[0] in types_in_buffer and seq[1] in types_in_buffer:
                    match_triggered = True

            elif rule.rule_type == "MULTI_EVENT":
                conds = json.loads(rule.conditions_json or "{}")
                target_type = conds.get("event_type")
                if target_type == event.event_type:
                    match_triggered = True

            # Step 4: Process Match
            if match_triggered:
                matched_evt_ids = [item[0] for item in active_events]
                
                # Create CorrelationMatch
                match_code = f"MAT-2026-{uuid.uuid4().hex[:6].upper()}"
                corr_match = CorrelationMatch(
                    match_code=match_code,
                    rule_id=rule.id,
                    title=f"Correlated Signal: {rule.name}",
                    description=f"Rule {rule.rule_code} triggered with {len(matched_evt_ids)} correlated security events on asset {event.asset_id}.",
                    severity=rule.severity,
                    asset_id=event.asset_id,
                    user=event.user,
                    source_ip=event.source_ip,
                    event_count=len(matched_evt_ids),
                    event_ids_json=json.dumps(matched_evt_ids)
                )
                db.add(corr_match)
                db.flush()

                # Deduplicate Alert Storms (Check if open alert exists for rule+asset within 5 minutes)
                five_min_ago = now - datetime.timedelta(minutes=5)
                existing_alert = db.query(Alert).filter(
                    Alert.rule_id == rule.id,
                    Alert.asset_id == event.asset_id,
                    Alert.status.in_(["NEW", "ACKNOWLEDGED", "INVESTIGATING"]),
                    Alert.first_seen >= five_min_ago
                ).first()

                if existing_alert:
                    existing_alert.last_seen = now
                    existing_alert.event_count = (existing_alert.event_count or 1) + 1
                    alert_obj = existing_alert
                else:
                    # Create New Alert
                    alrt_code = f"ALRT-SOC-{uuid.uuid4().hex[:6].upper()}"
                    alert_obj = Alert(
                        code=alrt_code,
                        rule_id=rule.id,
                        asset_id=event.asset_id,
                        asset_name=event.source,
                        title=f"{rule.name} on {event.source}",
                        description=rule.description,
                        severity=rule.severity,
                        source_ip=event.source_ip,
                        detection_rule=f"{rule.rule_code}: {rule.name}",
                        mitre_technique=f"{rule.technique_id} - Correlated Security Signal",
                        confidence="94.7%",
                        status="NEW",
                        first_seen=now,
                        last_seen=now,
                        event_count=len(matched_evt_ids)
                    )
                    db.add(alert_obj)
                    db.flush()
                    generated_alerts.append(alert_obj)

                # Incident Auto-Creation Threshold (CRITICAL or HIGH severity)
                if rule.severity in ["CRITICAL", "HIGH"] and not alert_obj.incident_id:
                    inc_code = f"INC-SOC-{uuid.uuid4().hex[:6].upper()}"
                    incident = Incident(
                        code=inc_code,
                        title=f"AUTOMATED INCIDENT: {rule.name} on {event.source}",
                        severity=rule.severity,
                        status="OPEN",
                        source="CYBERNEXUS CORRELATION & DETECTION ENGINE",
                        primary_asset=event.source,
                        asset_name=event.source,
                        technique=f"{rule.technique_id} - Correlated Attack Pattern",
                        description=f"Correlated Security Incident triggered by rule {rule.rule_code}. Asset: {event.source}, Source IP: {event.source_ip}, Affected User: {event.user}.",
                        assigned_to="analyst01"
                    )
                    db.add(incident)
                    db.flush()

                    alert_obj.incident_id = incident.id
                    generated_incidents.append(incident)

                    # Preserve Forensic Evidence item
                    ev_content = f"Event ID: {event.id} | Timestamp: {event.timestamp} | Action: {event.action} | Result: {event.result} | Source IP: {event.source_ip}"
                    sha_hash = hashlib.sha256(ev_content.encode('utf-8')).hexdigest()

                    evidence_item = Evidence(
                        incident_id=incident.id,
                        asset_id=event.asset_id,
                        evidence_type="CORRELATED_SECURITY_EVENT",
                        source=event.source,
                        description=f"Correlated Telemetry Event {event.event_code} ({event.action})",
                        content=ev_content,
                        sha256=sha_hash,
                        integrity_status="VERIFIED"
                    )
                    db.add(evidence_item)

                db.commit()

        return {
            "alerts": generated_alerts,
            "incidents": generated_incidents
        }

correlation_engine = CorrelationEngine()
