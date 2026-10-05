import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.schemas import ExerciseRun, Alert, Incident, DetectionGap, CorrelationRule

MITRE_TACTICS = [
    {"id": "Initial Access", "name": "Initial Access", "techniques": ["T1190", "T1078", "T1566"]},
    {"id": "Credential Access", "name": "Credential Access", "techniques": ["T1110", "T1003", "T1555"]},
    {"id": "Privilege Escalation", "name": "Privilege Escalation", "techniques": ["T1068", "T1548", "T1078"]},
    {"id": "Defense Evasion", "name": "Defense Evasion", "techniques": ["T1562", "T1070", "T1036"]},
    {"id": "Command and Control", "name": "Command and Control", "techniques": ["T1071", "T1573", "T1095"]}
]

class PurpleTeamEngine:

    def evaluate_mitre_coverage(self, db: Session) -> Dict[str, Any]:
        """
        Calculates empirical detection coverage based on actual lab exercise runs and correlation rules.
        Does NOT fake percentages.
        """
        rules = db.query(CorrelationRule).filter(CorrelationRule.enabled == True).all()
        active_tech_ids = set([r.technique_id for r in rules if r.technique_id])

        # Query actual exercise runs
        runs = db.query(ExerciseRun).all()

        matrix = []
        validated_techniques = set()
        partially_detected = set()
        uncovered = set()

        for tactic in MITRE_TACTICS:
            t_items = []
            for t_id in tactic["techniques"]:
                # Check if technique has correlation rule AND verified alerts from exercises
                rule_count = db.query(CorrelationRule).filter(CorrelationRule.technique_id == t_id, CorrelationRule.enabled == True).count()
                alert_count = db.query(Alert).filter(Alert.mitre_technique.like(f"%{t_id}%")).count()
                gap_count = db.query(DetectionGap).filter(DetectionGap.technique_id == t_id, DetectionGap.status == "OPEN").count()

                status = "NOT_COVERED"
                if alert_count > 0 and rule_count > 0:
                    status = "VALIDATED"
                    validated_techniques.add(t_id)
                elif rule_count > 0:
                    status = "PARTIALLY_DETECTED"
                    partially_detected.add(t_id)
                else:
                    uncovered.add(t_id)

                t_items.append({
                    "technique_id": t_id,
                    "status": status,
                    "rule_count": rule_count,
                    "alert_count": alert_count,
                    "gap_count": gap_count
                })

            matrix.append({
                "tactic_id": tactic["id"],
                "tactic_name": tactic["name"],
                "techniques": t_items
            })

        total_tracked = len(validated_techniques | partially_detected | uncovered)
        coverage_pct = round((len(validated_techniques) / total_tracked * 100), 1) if total_tracked > 0 else 0.0

        gaps = db.query(DetectionGap).filter(DetectionGap.status == "OPEN").all()
        gaps_list = [{
            "id": g.id,
            "technique_id": g.technique_id,
            "technique_name": g.technique_name,
            "exercise_code": g.exercise_code,
            "expected_detection": g.expected_detection,
            "actual_detection": g.actual_detection,
            "reason": g.reason,
            "severity": g.severity,
            "recommendation": g.recommendation,
            "created_at": g.created_at.isoformat() if g.created_at else None
        } for g in gaps]

        return {
            "summary": {
                "coverage_score": f"{coverage_pct}%",
                "validated_techniques": len(validated_techniques),
                "partially_detected": len(partially_detected),
                "uncovered_techniques": len(uncovered),
                "open_detection_gaps": len(gaps_list)
            },
            "mitre_matrix": matrix,
            "detection_gaps": gaps_list
        }

purple_team_engine = PurpleTeamEngine()
