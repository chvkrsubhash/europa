from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.models import TaskItem
from backend.auth import get_current_user
from backend.database import get_tags_col, get_tasks_col, get_notebooks_col, get_pages_col, get_sections_col

router = APIRouter(prefix="/api", tags=["tags_tasks"])

@router.get("/tags/summary")
async def get_tags_summary(current_user: Dict[str, Any] = Depends(get_current_user)):
    tags_col = get_tags_col()
    tags = await tags_col.find({})
    
    # Group by tag_type
    grouped = {
        "todo": [],
        "important": [],
        "question": [],
        "remember": [],
        "definition": [],
        "exam": [],
        "follow_up": [],
        "contact": [],
        "idea": [],
        "custom": []
    }
    for t in tags:
        tt = t.get("tag_type", "custom")
        if tt not in grouped:
            grouped[tt] = []
        grouped[tt].append(t)
        
    return grouped

@router.post("/tags")
async def create_tag(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    tags_col = get_tags_col()
    new_tag = {
        "id": f"tag_{int(datetime.utcnow().timestamp()*1000)}",
        "notebook_id": payload.get("notebook_id"),
        "page_id": payload.get("page_id"),
        "block_id": payload.get("block_id"),
        "tag_type": payload.get("tag_type", "important"),
        "label": payload.get("label", "Important"),
        "content_snippet": payload.get("content_snippet", ""),
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    await tags_col.insert_one(new_tag)
    return new_tag

# Tasks
@router.get("/tasks")
async def list_tasks(completed: Optional[bool] = None, priority: Optional[str] = None, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_tasks_col()
    query = {"user_id": current_user["id"]}
    if completed is not None:
        query["is_completed"] = completed
    if priority:
        query["priority"] = priority
    tasks = await col.find(query, sort=[("created_at", -1)])
    return tasks

@router.post("/tasks")
async def create_task(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_tasks_col()
    task = TaskItem(
        user_id=current_user["id"],
        notebook_id=payload.get("notebook_id", ""),
        page_id=payload.get("page_id", ""),
        block_id=payload.get("block_id"),
        title=payload.get("title", "New Task"),
        is_completed=payload.get("is_completed", False),
        priority=payload.get("priority", "medium"),
        due_date=payload.get("due_date")
    )
    doc = task.model_dump()
    await col.insert_one(doc)
    return doc

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_tasks_col()
    payload["updated_at"] = datetime.utcnow().isoformat() + "Z"
    await col.update_one({"id": task_id, "user_id": current_user["id"]}, {"$set": payload})
    return await col.find_one({"id": task_id})

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_tasks_col()
    await col.delete_one({"id": task_id, "user_id": current_user["id"]})
    return {"status": "success"}

