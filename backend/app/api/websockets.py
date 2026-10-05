from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import asyncio
import json

router = APIRouter(prefix="/ws", tags=["WebSockets"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, lab_id: str):
        await websocket.accept()
        if lab_id not in self.active_connections:
            self.active_connections[lab_id] = []
        self.active_connections[lab_id].append(websocket)

    def disconnect(self, websocket: WebSocket, lab_id: str):
        if lab_id in self.active_connections:
            if websocket in self.active_connections[lab_id]:
                self.active_connections[lab_id].remove(websocket)

    async def broadcast_to_lab(self, lab_id: str, message: dict):
        if lab_id in self.active_connections:
            for connection in self.active_connections[lab_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    pass

ws_manager = ConnectionManager()

@router.websocket("/labs/{lab_id}")
async def websocket_lab_stream(websocket: WebSocket, lab_id: str):
    await ws_manager.connect(websocket, lab_id)
    try:
        # Send initial heartbeat message
        await websocket.send_text(json.dumps({
            "event_type": "CONNECTED",
            "message": f"Real-time WebSocket telemetry connected to lab: {lab_id}",
            "lab_id": lab_id
        }))
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            await websocket.send_text(json.dumps({
                "event_type": "PONG",
                "message": "Heartbeat ACK",
                "received": data
            }))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, lab_id)
    except Exception:
        ws_manager.disconnect(websocket, lab_id)

@router.websocket("/assessments/{assessment_id}")
async def websocket_assessment_stream(websocket: WebSocket, assessment_id: str):
    await ws_manager.connect(websocket, assessment_id)
    try:
        await websocket.send_text(json.dumps({
            "event_type": "CONNECTED",
            "message": f"Real-time WebSocket telemetry connected to Assessment: {assessment_id}",
            "assessment_id": assessment_id
        }))
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(json.dumps({
                "event_type": "PONG",
                "message": "Heartbeat ACK",
                "received": data
            }))
    except Exception:
        ws_manager.disconnect(websocket, assessment_id)

