from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/terminal", tags=["Terminal"])

class CommandRequest(BaseModel):
    command: str

@router.post("/execute")
def execute_terminal_command(req: CommandRequest):
    cmd = req.command.strip().lower()
    
    if cmd == "help":
        return {
            "status": "SUCCESS",
            "output": [
                "CYBERNEXUS CONTROLLED COMMAND REGISTRY v2.0",
                "Available security commands:",
                "  system.status    - Core services operational state",
                "  lab.list         - List registered Cyber Range lab environments",
                "  lab.status       - Active lab status, asset count & Docker state",
                "  lab.start        - Initiate Cyber Range startup sequence",
                "  lab.stop         - Initiate Cyber Range shutdown sequence",
                "  lab.restart      - Restart Cyber Range lab containers",
                "  assets.list      - List registered enterprise lab target assets",
                "  asset.status     - Display detailed asset telemetry",
                "  network.status   - Display isolated Docker lab network details",
                "  services.list    - List active lab microservices",
                "  incidents.list   - Displays active high & critical incidents",
                "  threats.summary  - Shows current threat severity counts",
                "  ai.status        - Displays NEXUS AI neural model status",
                "  clear            - Clears terminal view"
            ]
        }
    elif cmd in ["lab.status", "range.status"]:
        return {
            "status": "SUCCESS",
            "output": [
                "LAB SLUG        : NEXORA-ENTERPRISE-LAB",
                "STATUS          : RUNNING / CONNECTED",
                "DOCKER ENGINE   : DOCKER COMPOSE ISOLATED BRIDGE",
                "NETWORK SUBNET  : 10.240.0.0/16 (cybernexus_lab_net)",
                "NETWORK STATUS  : ISOLATED (NO UNRESTRICTED PUBLIC EGRESS)",
                "TOTAL ASSETS    : 5 (WEB-01, API-01, DB-01, LINUX-01, CONTAINER-01)",
                "RUNNING ASSETS  : 5",
                "ERROR ASSETS    : 0"
            ]
        }
    elif cmd == "lab.list":
        return {
            "status": "SUCCESS",
            "output": [
                "SLUG                NAME                    ENVIRONMENT            STATUS",
                "nexora-enterprise   NEXORA ENTERPRISE LAB   ISOLATED_CYBER_RANGE   RUNNING"
            ]
        }
    elif cmd == "lab.start":
        return {
            "status": "SUCCESS",
            "output": [
                "[+] Initiating Cyber Range startup sequence...",
                "[+] Verifying authorization and RBAC permissions...",
                "[+] Initializing isolated Docker bridge network 'cybernexus_lab_net'...",
                "[+] Starting lab containers: WEB-01, API-01, DB-01, LINUX-01, CONTAINER-01...",
                "[+] All 5 lab assets online. Lab status: RUNNING."
            ]
        }
    elif cmd == "lab.stop":
        return {
            "status": "SUCCESS",
            "output": [
                "[+] Initiating Cyber Range shutdown sequence...",
                "[+] Stopping containers: WEB-01, API-01, DB-01, LINUX-01, CONTAINER-01...",
                "[+] Tearing down isolated lab network...",
                "[+] Cyber Range lab stopped successfully."
            ]
        }
    elif cmd == "lab.restart":
        return {
            "status": "SUCCESS",
            "output": [
                "[+] Restarting Cyber Range lab containers...",
                "[+] Shutdown completed.",
                "[+] Startup completed. Lab status: RUNNING."
            ]
        }
    elif cmd == "network.status":
        return {
            "status": "SUCCESS",
            "output": [
                "NETWORK NAME   : cybernexus_lab_net",
                "DRIVER         : bridge",
                "SUBNET         : 10.240.0.0/16",
                "GATEWAY        : 10.240.0.1",
                "ISOLATION      : STRICT PRIVATE BRIDGE",
                "ATTACHED ASSETS: WEB-01 (10.240.0.10), API-01 (10.240.0.11),",
                "                 DB-01 (10.240.0.12), LINUX-01 (10.240.0.23),",
                "                 CONTAINER-01 (10.240.0.30)"
            ]
        }
    elif cmd == "services.list":
        return {
            "status": "SUCCESS",
            "output": [
                "ASSET          SERVICE          PORT      PROTOCOL  STATUS",
                "WEB-01         HTTP/Nginx       80        TCP       ONLINE",
                "WEB-01         HTTPS/Nginx      443       TCP       ONLINE",
                "API-01         RESTful API      8080      TCP       ONLINE",
                "DB-01          PostgreSQL 16    5432      TCP       ONLINE (INTERNAL ONLY)",
                "LINUX-01       OpenSSH          22        TCP       ONLINE",
                "CONTAINER-01   Go Microservice  9000      TCP       ONLINE"
            ]
        }
    elif cmd == "system.status":
        return {
            "status": "SUCCESS",
            "output": [
                "API CORE        ONLINE",
                "DATABASE        ONLINE (SQLite/PostgreSQL)",
                "SOC ENGINE      ONLINE",
                "AI ENGINE       ONLINE",
                "CYBER RANGE     CONNECTED (DOCKER COMPOSE ISOLATED)"
            ]
        }
    elif cmd == "assets.list":
        return {
            "status": "SUCCESS",
            "output": [
                "ID          NAME          TYPE         STATUS      IP",
                "AST-001     API-01        SERVER/API   RUNNING     10.240.0.11",
                "AST-002     WEB-01        WEB APP      RUNNING     10.240.0.10",
                "AST-003     DB-01         DATABASE     RUNNING     10.240.0.12",
                "AST-004     LINUX-01      HOST         RUNNING     10.240.0.23",
                "AST-005     CONTAINER-01  DOCKER POD   RUNNING     10.240.0.30"
            ]
        }
    elif cmd == "incidents.list":
        return {
            "status": "SUCCESS",
            "output": [
                "INCIDENT ID   SEVERITY   ASSET      TITLE",
                "INC-0001      CRITICAL   API-01     Suspicious authentication sequence",
                "INC-0002      HIGH       LINUX-01   Unexpected privilege event",
                "INC-0003      HIGH       WEB-01     API anomaly detected",
                "INC-0004      MEDIUM     DB-01      Malware behavior pattern detected"
            ]
        }
    elif cmd == "threats.summary":
        return {
            "status": "SUCCESS",
            "output": [
                "SECURITY POSTURE SCORE : 87 / 100",
                "THREAT LEVEL           : ELEVATED",
                "CRITICAL THREATS       : 03",
                "HIGH THREATS           : 09",
                "MEDIUM THREATS         : 18",
                "LOW THREATS            : 22"
            ]
        }
    elif cmd == "ai.status":
        return {
            "status": "SUCCESS",
            "output": [
                "NEXUS AI SECURITY BRAIN v2.4",
                "MODEL                  : NEXUS-LLM-CYBER-8B",
                "STATUS                 : ONLINE & MONITORING",
                "CONFIDENCE METRIC      : 94.7%"
            ]
        }
    elif cmd == "clear":
        return {
            "status": "SUCCESS",
            "output": []
        }
    else:
        return {
            "status": "ERROR",
            "output": [
                f"COMMAND NOT AVAILABLE: '{cmd}'",
                "Type 'help' to view allowed security command registry."
            ]
        }
