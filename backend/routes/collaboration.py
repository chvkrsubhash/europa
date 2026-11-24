from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List, Any
import json
from datetime import datetime

router = APIRouter(prefix="/ws", tags=["collaboration"])

class ConnectionManager:
    def __init__(self):
        # page_id -> list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # page_id -> dict of user_id -> cursor/presence info
        self.presence: Dict[str, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket, page_id: str, user_info: Dict[str, Any]):
        await websocket.accept()
        if page_id not in self.active_connections:
            self.active_connections[page_id] = []
            self.presence[page_id] = {}
        self.active_connections[page_id].append(websocket)
        uid = user_info.get("id", f"guest_{id(websocket)}")
        self.presence[page_id][uid] = {
            "user_id": uid,
            "full_name": user_info.get("full_name", "Anonymous Collaborator"),
            "color": user_info.get("color", "#6941A5"),
            "x": 0,
            "y": 0,
            "last_active": datetime.utcnow().isoformat()
        }
        # Broadcast initial presence
        await self.broadcast(page_id, {
            "type": "presence_update",
            "presence": list(self.presence[page_id].values())
        })

    def disconnect(self, websocket: WebSocket, page_id: str):
        if page_id in self.active_connections:
            if websocket in self.active_connections[page_id]:
                self.active_connections[page_id].remove(websocket)
            if len(self.active_connections[page_id]) == 0:
                self.active_connections.pop(page_id, None)
                self.presence.pop(page_id, None)

    async def broadcast(self, page_id: str, message: dict, sender: WebSocket = None):
        if page_id in self.active_connections:
            msg_str = json.dumps(message)
            for connection in self.active_connections[page_id]:
                if connection != sender:
                    try:
                        await connection.send_text(msg_str)
                    except Exception:
                        pass

manager = ConnectionManager()

@router.websocket("/collab/{page_id}")
async def websocket_endpoint(websocket: WebSocket, page_id: str):
    await websocket.accept()
    if page_id not in manager.active_connections:
        manager.active_connections[page_id] = []
        manager.presence[page_id] = {}
    manager.active_connections[page_id].append(websocket)
    
    user_id = f"user_{int(datetime.utcnow().timestamp()*1000)}"
    manager.presence[page_id][user_id] = {
        "user_id": user_id,
        "full_name": "Collaborator",
        "color": "#6941A5",
        "x": 0,
        "y": 0
    }
    
    try:
        # Send current presence list to newly joined client
        await websocket.send_text(json.dumps({
            "type": "presence_update",
            "presence": list(manager.presence[page_id].values())
        }))
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            mtype = message.get("type")
            
            if mtype == "cursor":
                if page_id in manager.presence and user_id in manager.presence[page_id]:
                    manager.presence[page_id][user_id]["x"] = message.get("x", 0)
                    manager.presence[page_id][user_id]["y"] = message.get("y", 0)
                    manager.presence[page_id][user_id]["full_name"] = message.get("user_name", "Collaborator")
                await manager.broadcast(page_id, {
                    "type": "cursor",
                    "user_id": user_id,
                    "user_name": message.get("user_name", "Collaborator"),
                    "x": message.get("x", 0),
                    "y": message.get("y", 0)
                }, sender=websocket)
                
            elif mtype in ["block_moved", "block_updated", "block_created", "block_deleted", "ink_stroke"]:
                # Broadcast real-time canvas updates to all other peers
                await manager.broadcast(page_id, message, sender=websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, page_id)
        if page_id in manager.presence:
            manager.presence[page_id].pop(user_id, None)
            await manager.broadcast(page_id, {
                "type": "presence_update",
                "presence": list(manager.presence[page_id].values())
            })

