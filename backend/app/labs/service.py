import os
import yaml
import datetime
from sqlalchemy.orm import Session
from app.models.schemas import Lab, LabAsset, LabNetwork, LabService, LabEvent, LabRun, AuditLog
from app.labs.docker_manager import docker_manager
from typing import Dict, Any, List

class LabServiceManager:
    """
    Core Business & Lifecycle Service for CYBERNEXUS Cyber Range.
    Enforces strict state machine transitions, orchestrates DB state, Docker Compose operations,
    audit records, and real-time telemetry streaming.
    """

    def seed_nexora_lab_if_missing(self, db: Session) -> Lab:
        lab = db.query(Lab).filter(Lab.slug == "nexora-enterprise").first()
        if lab:
            return lab

        # Read YAML definition
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        yaml_path = os.path.join(base_dir, "cyber_range", "labs", "nexora-enterprise", "lab.yaml")

        if os.path.exists(yaml_path):
            with open(yaml_path, "r") as f:
                data = yaml.safe_load(f)
        else:
            data = {
                "name": "NEXORA ENTERPRISE LAB",
                "slug": "nexora-enterprise",
                "description": "Enterprise multi-tier isolated cyber range laboratory",
                "network": {"name": "cybernexus_lab_net", "subnet": "10.240.0.0/16", "gateway": "10.240.0.1"},
                "assets": [
                    {"name": "WEB-01", "hostname": "web-01.lab.local", "asset_type": "WEB SERVER", "ip_address": "10.240.0.10", "role": "Web Gateway", "criticality": "HIGH", "services": [{"name": "HTTP", "port": 80}]},
                    {"name": "API-01", "hostname": "api-01.lab.local", "asset_type": "SERVER/API", "ip_address": "10.240.0.11", "role": "REST Microservices", "criticality": "CRITICAL", "services": [{"name": "API", "port": 8080}]},
                    {"name": "DB-01", "hostname": "db-01.lab.local", "asset_type": "DATABASE", "ip_address": "10.240.0.12", "role": "Relational DB", "criticality": "CRITICAL", "services": [{"name": "PostgreSQL", "port": 5432}]},
                    {"name": "LINUX-01", "hostname": "linux-01.lab.local", "asset_type": "HOST", "ip_address": "10.240.0.23", "role": "Workstation", "criticality": "HIGH", "services": [{"name": "SSH", "port": 22}]},
                    {"name": "CONTAINER-01", "hostname": "container-01.lab.local", "asset_type": "DOCKER POD", "ip_address": "10.240.0.30", "role": "Worker Microservice", "criticality": "MEDIUM", "services": [{"name": "WORKER", "port": 9000}]}
                ]
            }

        # Create Lab
        lab = Lab(
            name=data["name"],
            slug=data["slug"],
            description=data["description"],
            status="STOPPED",
            environment="ISOLATED_CYBER_RANGE",
            created_by="analyst01"
        )
        db.add(lab)
        db.commit()
        db.refresh(lab)

        # Create Lab Network
        net = LabNetwork(
            lab_id=lab.id,
            name=data["network"]["name"],
            subnet=data["network"]["subnet"],
            gateway=data["network"]["gateway"],
            status="ISOLATED"
        )
        db.add(net)

        # Create Lab Assets & Services
        for a_data in data["assets"]:
            asset = LabAsset(
                lab_id=lab.id,
                name=a_data["name"],
                hostname=a_data["hostname"],
                asset_type=a_data["asset_type"],
                ip_address=a_data["ip_address"],
                os=a_data.get("os", "Alpine Linux v3.19"),
                role=a_data["role"],
                criticality=a_data["criticality"],
                status="STOPPED"
            )
            db.add(asset)
            db.commit()
            db.refresh(asset)

            for s_data in a_data.get("services", []):
                svc = LabService(
                    asset_id=asset.id,
                    name=s_data["name"],
                    protocol=s_data.get("protocol", "TCP"),
                    port=s_data["port"],
                    status="STOPPED",
                    version=s_data.get("version", "v1.0")
                )
                db.add(svc)

        # Initial Event
        evt = LabEvent(
            lab_id=lab.id,
            event_type="LAB_CREATED",
            message="NEXORA ENTERPRISE LAB environment initialized in database.",
            severity="INFO"
        )
        db.add(evt)
        db.commit()
        db.refresh(lab)
        return lab

    def get_labs(self, db: Session) -> List[Lab]:
        self.seed_nexora_lab_if_missing(db)
        return db.query(Lab).all()

    def get_lab(self, db: Session, lab_id: str) -> Lab:
        lab = db.query(Lab).filter((Lab.id == lab_id) | (Lab.slug == lab_id)).first()
        if not lab:
            return self.seed_nexora_lab_if_missing(db)
        return lab

    def start_lab(self, db: Session, lab_id: str, username: str = "analyst01") -> Dict[str, Any]:
        lab = self.get_lab(db, lab_id)
        
        # State Transition: STARTING
        lab.status = "STARTING"
        db.commit()

        # Log event
        evt_start = LabEvent(
            lab_id=lab.id,
            event_type="LAB_STARTING",
            message=f"Lab start sequence initiated by {username}.",
            severity="INFO"
        )
        db.add(evt_start)
        db.commit()

        # Invoke Docker Manager
        res = docker_manager.start_lab_containers()

        if res["success"]:
            lab.status = "RUNNING"
            for asset in lab.assets:
                asset.status = "RUNNING"
                for svc in asset.services:
                    svc.status = "ONLINE"
            
            evt_ok = LabEvent(
                lab_id=lab.id,
                event_type="LAB_STARTED",
                message="All 5 lab assets (WEB-01, API-01, DB-01, LINUX-01, CONTAINER-01) started and online.",
                severity="INFO"
            )
            db.add(evt_ok)
        else:
            # Docker is offline or error occurred
            # Check if Docker engine itself is offline
            docker_check = docker_manager.is_docker_available()
            if not docker_check["available"]:
                lab.status = "STOPPED" # Remain in controlled stopped state with diagnostic note
                evt_err = LabEvent(
                    lab_id=lab.id,
                    event_type="DOCKER_OFFLINE",
                    message=f"DOCKER VERIFICATION BLOCKED: Docker Desktop/Engine is not running on host system. ({res['message']})",
                    severity="WARNING"
                )
            else:
                lab.status = "ERROR"
                evt_err = LabEvent(
                    lab_id=lab.id,
                    event_type="LAB_ERROR",
                    message=f"Lab container startup failed: {res['message']}",
                    severity="ERROR"
                )
            db.add(evt_err)

        # Record Audit Log
        audit = AuditLog(
            username=username,
            role="SECURITY ANALYST",
            action="START_CYBER_RANGE",
            target=lab.name,
            result="SUCCESS" if res["success"] else "WARNING"
        )
        db.add(audit)
        db.commit()
        db.refresh(lab)

        return {
            "lab_id": lab.id,
            "status": lab.status,
            "success": res["success"],
            "message": res["message"],
            "docker_available": docker_manager.is_docker_available()["available"]
        }

    def stop_lab(self, db: Session, lab_id: str, username: str = "analyst01") -> Dict[str, Any]:
        lab = self.get_lab(db, lab_id)
        
        lab.status = "STOPPING"
        db.commit()

        evt_stop = LabEvent(
            lab_id=lab.id,
            event_type="LAB_STOPPING",
            message=f"Lab shutdown sequence initiated by {username}.",
            severity="INFO"
        )
        db.add(evt_stop)
        db.commit()

        res = docker_manager.stop_lab_containers()

        lab.status = "STOPPED"
        for asset in lab.assets:
            asset.status = "STOPPED"
            for svc in asset.services:
                svc.status = "STOPPED"

        evt_done = LabEvent(
            lab_id=lab.id,
            event_type="LAB_STOPPED",
            message="Cyber Range lab environment stopped. Isolated network torn down.",
            severity="INFO"
        )
        db.add(evt_done)

        audit = AuditLog(
            username=username,
            role="SECURITY ANALYST",
            action="STOP_CYBER_RANGE",
            target=lab.name,
            result="SUCCESS"
        )
        db.add(audit)
        db.commit()
        db.refresh(lab)

        return {
            "lab_id": lab.id,
            "status": lab.status,
            "success": True,
            "message": "Cyber Range lab stopped successfully."
        }

    def restart_lab(self, db: Session, lab_id: str, username: str = "analyst01") -> Dict[str, Any]:
        self.stop_lab(db, lab_id, username)
        return self.start_lab(db, lab_id, username)

    def get_lab_topology(self, db: Session, lab_id: str) -> Dict[str, Any]:
        lab = self.get_lab(db, lab_id)
        net = lab.networks[0] if lab.networks else None
        
        nodes = [
          {
            "id": "ext-net",
            "label": "CYBERNEXUS COMMAND CENTER",
            "type": "GATEWAY",
            "status": "ONLINE",
            "ip": "10.240.0.1"
          }
        ]

        edges = []

        for asset in lab.assets:
            nodes.append({
                "id": asset.id,
                "label": asset.name,
                "type": asset.asset_type,
                "status": asset.status,
                "ip": asset.ip_address,
                "criticality": asset.criticality,
                "services": [s.name for s in asset.services]
            })

            # Connect asset to gateway
            edges.append({
                "id": f"edge-gw-{asset.id}",
                "source": "ext-net",
                "target": asset.id,
                "label": "ISOLATED_BRIDGE"
            })

        # Connect inter-lab asset network paths
        web = next((a for a in lab.assets if a.name == "WEB-01"), None)
        api = next((a for a in lab.assets if a.name == "API-01"), None)
        db_ast = next((a for a in lab.assets if a.name == "DB-01"), None)

        if web and api:
            edges.append({"id": "edge-web-api", "source": web.id, "target": api.id, "label": "HTTP/REST"})
        if api and db_ast:
            edges.append({"id": "edge-api-db", "source": api.id, "target": db_ast.id, "label": "POSTGRESQL"})

        return {
            "lab_id": lab.id,
            "lab_name": lab.name,
            "network": {
                "name": net.name if net else "cybernexus_lab_net",
                "subnet": net.subnet if net else "10.240.0.0/16",
                "status": net.status if net else "ISOLATED"
            },
            "nodes": nodes,
            "edges": edges
        }

lab_service = LabServiceManager()
