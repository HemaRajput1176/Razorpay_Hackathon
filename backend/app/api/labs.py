from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.labs.service import lab_service
from app.labs.docker_manager import docker_manager
from app.models.schemas import LabEvent

router = APIRouter(prefix="/labs", tags=["Cyber Range Labs"])

@router.get("")
def list_labs(db: Session = Depends(get_db)):
    labs = lab_service.get_labs(db)
    docker_info = docker_manager.is_docker_available()
    return {
        "labs": [
            {
                "id": l.id,
                "name": l.name,
                "slug": l.slug,
                "description": l.description,
                "status": l.status,
                "environment": l.environment,
                "asset_count": len(l.assets),
                "created_at": l.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
            }
            for l in labs
        ],
        "docker_engine": docker_info
    }

@router.get("/{lab_id}")
def get_lab_detail(lab_id: str, db: Session = Depends(get_db)):
    lab = lab_service.get_lab(db, lab_id)
    docker_info = docker_manager.is_docker_available()
    return {
        "id": lab.id,
        "name": lab.name,
        "slug": lab.slug,
        "description": lab.description,
        "status": lab.status,
        "environment": lab.environment,
        "created_by": lab.created_by,
        "created_at": lab.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "docker_engine": docker_info,
        "network": {
            "name": lab.networks[0].name if lab.networks else "cybernexus_lab_net",
            "subnet": lab.networks[0].subnet if lab.networks else "10.240.0.0/16",
            "gateway": lab.networks[0].gateway if lab.networks else "10.240.0.1",
            "status": lab.networks[0].status if lab.networks else "ISOLATED"
        },
        "assets": [
            {
                "id": a.id,
                "name": a.name,
                "hostname": a.hostname,
                "asset_type": a.asset_type,
                "ip_address": a.ip_address,
                "os": a.os,
                "role": a.role,
                "criticality": a.criticality,
                "status": a.status,
                "services": [
                    {
                        "id": s.id,
                        "name": s.name,
                        "protocol": s.protocol,
                        "port": s.port,
                        "status": s.status,
                        "version": s.version
                    }
                    for s in a.services
                ]
            }
            for a in lab.assets
        ]
    }

@router.post("/{lab_id}/start")
def start_lab(lab_id: str, db: Session = Depends(get_db)):
    return lab_service.start_lab(db, lab_id)

@router.post("/{lab_id}/stop")
def stop_lab(lab_id: str, db: Session = Depends(get_db)):
    return lab_service.stop_lab(db, lab_id)

@router.post("/{lab_id}/restart")
def restart_lab(lab_id: str, db: Session = Depends(get_db)):
    return lab_service.restart_lab(db, lab_id)

@router.get("/{lab_id}/status")
def get_lab_status(lab_id: str, db: Session = Depends(get_db)):
    lab = lab_service.get_lab(db, lab_id)
    docker_info = docker_manager.is_docker_available()
    return {
        "lab_id": lab.id,
        "status": lab.status,
        "docker_engine": docker_info,
        "running_assets": sum(1 for a in lab.assets if a.status == "RUNNING"),
        "total_assets": len(lab.assets)
    }

@router.get("/{lab_id}/topology")
def get_lab_topology(lab_id: str, db: Session = Depends(get_db)):
    return lab_service.get_lab_topology(db, lab_id)

@router.get("/{lab_id}/events")
def get_lab_events(lab_id: str, db: Session = Depends(get_db)):
    lab = lab_service.get_lab(db, lab_id)
    events = db.query(LabEvent).filter(LabEvent.lab_id == lab.id).order_by(LabEvent.timestamp.desc()).limit(50).all()
    return [
        {
            "id": e.id,
            "event_type": e.event_type,
            "message": e.message,
            "severity": e.severity,
            "timestamp": e.timestamp.strftime("%H:%M:%S")
        }
        for e in events
    ]

@router.get("/{lab_id}/assets/{asset_id}")
def get_asset_detail(lab_id: str, asset_id: str, db: Session = Depends(get_db)):
    lab = lab_service.get_lab(db, lab_id)
    for a in lab.assets:
        if a.id == asset_id or a.name == asset_id:
            return {
                "id": a.id,
                "name": a.name,
                "hostname": a.hostname,
                "asset_type": a.asset_type,
                "ip_address": a.ip_address,
                "os": a.os,
                "role": a.role,
                "criticality": a.criticality,
                "status": a.status,
                "container_id": a.container_id or f"container-id-{a.name.lower()}",
                "services": [
                    {
                        "name": s.name,
                        "protocol": s.protocol,
                        "port": s.port,
                        "status": s.status,
                        "version": s.version
                    }
                    for s in a.services
                ],
                "network": {
                    "name": lab.networks[0].name if lab.networks else "cybernexus_lab_net",
                    "ip": a.ip_address,
                    "gateway": lab.networks[0].gateway if lab.networks else "10.240.0.1"
                }
            }
    raise HTTPException(status_code=404, detail="Lab asset not found")
