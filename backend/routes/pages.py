from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.models import Page, PageCreate, PageUpdate
from backend.auth import get_current_user
from backend.database import get_pages_col, get_sections_col, get_canvas_blocks_col, get_ink_strokes_col

router = APIRouter(prefix="/api", tags=["pages"])

@router.get("/sections/{section_id}/pages")
async def list_pages(section_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_pages_col()
    return await col.find({"section_id": section_id, "is_deleted": False}, sort=[("order", 1)])

@router.post("/pages")
async def create_page(page_in: PageCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    sec_col = get_sections_col()
    sec = await sec_col.find_one({"id": page_in.section_id})
    if not sec:
        raise HTTPException(status_code=404, detail="Parent section not found")
        
    col = get_pages_col()
    existing_count = await col.count_documents({"section_id": page_in.section_id})
    
    page = Page(
        section_id=page_in.section_id,
        notebook_id=sec["notebook_id"],
        title=page_in.title or "Untitled Page",
        parent_page_id=page_in.parent_page_id,
        order=existing_count
    )
    doc = page.model_dump()
    await col.insert_one(doc)
    return doc

@router.get("/pages/{page_id}")
async def get_page(page_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_pages_col()
    page = await col.find_one({"id": page_id})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@router.put("/pages/{page_id}")
async def update_page(page_id: str, page_in: PageUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_pages_col()
    page = await col.find_one({"id": page_id})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
        
    data = {k: v for k, v in page_in.model_dump().items() if v is not None}
    data["updated_at"] = datetime.utcnow().isoformat() + "Z"
    await col.update_one({"id": page_id}, {"$set": data})
    return await col.find_one({"id": page_id})

@router.delete("/pages/{page_id}")
async def delete_page(page_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_pages_col()
    await col.update_one({"id": page_id}, {"$set": {"is_deleted": True, "updated_at": datetime.utcnow().isoformat() + "Z"}})
    return {"status": "success"}

@router.post("/pages/{page_id}/duplicate")
async def duplicate_page(page_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_pages_col()
    page = await col.find_one({"id": page_id})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
        
    new_page = page.copy()
    new_page["id"] = f"page_{int(datetime.utcnow().timestamp()*1000)}"
    new_page["title"] = f"{page['title']} (Copy)"
    new_page["order"] = page.get("order", 0) + 1
    new_page["created_at"] = datetime.utcnow().isoformat() + "Z"
    new_page["updated_at"] = datetime.utcnow().isoformat() + "Z"
    await col.insert_one(new_page)
    
    # Duplicate blocks
    blocks_col = get_canvas_blocks_col()
    blocks = await blocks_col.find({"page_id": page_id})
    for b in blocks:
        nb = b.copy()
        nb["id"] = f"blk_{int(datetime.utcnow().timestamp()*1000)}_{b['id'][-4:]}"
        nb["page_id"] = new_page["id"]
        await blocks_col.insert_one(nb)
        
    # Duplicate ink strokes
    ink_col = get_ink_strokes_col()
    strokes = await ink_col.find({"page_id": page_id})
    for s in strokes:
        ns = s.copy()
        ns["id"] = f"ink_{int(datetime.utcnow().timestamp()*1000)}_{s['id'][-4:]}"
        ns["page_id"] = new_page["id"]
        await ink_col.insert_one(ns)
        
    return new_page

