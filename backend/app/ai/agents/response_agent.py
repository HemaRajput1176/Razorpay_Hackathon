from typing import Dict, Any, List
from app.ai.security.tool_policy import validate_response_action

class ResponseAgent:
    """
    Response Planner Agent: Generates containment and mitigation plans.
    Validates all actions against safety policies (Human Approval + 10.240.0.0/16 Lab Boundary enforcement).
    """
    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        proposed_actions = [
            {
                "action_code": "ACT-001",
                "target_asset_name": "CONTAINER-01",
                "target_ip": "10.240.0.15",
                "action_type": "ISOLATE_CONTAINER",
                "command_to_execute": "docker network disconnect cybernexus_cyber_range_net container_01_pod",
                "risk_level": "HIGH",
                "is_lab_contained": True,
                "status": "PENDING_APPROVAL"
            },
            {
                "action_code": "ACT-002",
                "target_asset_name": "API-01",
                "target_ip": "10.240.0.12",
                "action_type": "BLOCK_IP",
                "command_to_execute": "iptables -A INPUT -s 10.240.0.100 -j DROP",
                "risk_level": "MEDIUM",
                "is_lab_contained": True,
                "status": "PENDING_APPROVAL"
            }
        ]

        # Enforce safety policy validation on each action
        validated_actions = []
        for act in proposed_actions:
            validate_response_action(act["action_type"], act["target_ip"], act["target_asset_name"])
            validated_actions.append(act)

        response_plan = {
            "plan_code": "RESP-001",
            "title": "NEXUS AI Automated Containment & Threat Mitigation Plan",
            "status": "PROPOSED",
            "actions": validated_actions
        }

        recommendations = [
            {
                "recommendation_code": "REC-001",
                "title": "Isolate Compromised Container Pod CONTAINER-01",
                "description": "Disconnect CONTAINER-01 from internal bridge network to halt lateral movement.",
                "action_type": "CONTAINMENT",
                "priority": "CRITICAL",
                "risk_impact": "Prevents unauthorized database exfiltration while keeping log ingestion active.",
                "evidence_citations": ["EVT-102", "EVT-103", "ALRT-SOC-8F92"]
            },
            {
                "recommendation_code": "REC-002",
                "title": "Patch Prepared Statements in API Auth Handler",
                "description": "Remediate SQL injection vulnerability by parametrizing queries in auth controller.",
                "action_type": "REMEDIATION",
                "priority": "HIGH",
                "risk_impact": "Permanently neutralizes exploit vector.",
                "evidence_citations": ["HYP-001", "FND-001"]
            }
        ]

        summary = "Response Agent generated 2 containment actions. Both actions validated within authorized lab subnets (10.240.0.0/16) and held for human approval."

        return {
            "agent_name": "RESPONSE_AGENT",
            "status": "SUCCESS",
            "summary": summary,
            "response_plan": response_plan,
            "recommendations": recommendations,
            "tokens_used": 1350
        }
