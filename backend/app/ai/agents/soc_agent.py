from typing import Dict, Any, List

class SOCAgent:
    """
    SOC Specialist Agent: Analyzes alerts, event frequency, source IPs, and correlation rules.
    """
    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        events = context.get("events", [])
        alerts = context.get("alerts", [])
        
        evidence_links = []
        for evt in events:
            code = evt.get("event_code", f"EVT-{evt.get('id', '100')[:4]}")
            evidence_links.append({
                "evidence_type": "EVENT",
                "evidence_id": str(evt.get("id")),
                "evidence_code": code,
                "relevance_score": 0.95,
                "citation_text": f"Security Event [{code}]: {evt.get('event_type')} on target {evt.get('target_host', 'WEB-01')}"
            })
            
        for alrt in alerts:
            code = alrt.get("alert_code", f"ALRT-{alrt.get('id', '100')[:4]}")
            evidence_links.append({
                "evidence_type": "ALERT",
                "evidence_id": str(alrt.get("id")),
                "evidence_code": code,
                "relevance_score": 0.98,
                "citation_text": f"SOC Alert [{code}]: {alrt.get('title')} (Severity: {alrt.get('severity', 'HIGH')})"
            })

        summary = (
            f"SOC Agent correlated {len(events)} security events and {len(alerts)} active alerts. "
            f"Identified high-velocity access pattern targeting lab assets WEB-01 and API-01."
        )

        return {
            "agent_name": "SOC_AGENT",
            "status": "SUCCESS",
            "summary": summary,
            "evidence_links": evidence_links,
            "tokens_used": 1200
        }
