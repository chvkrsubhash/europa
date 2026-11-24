from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.models import Notebook, NotebookCreate, NotebookUpdate
from backend.auth import get_current_user
from backend.database import get_notebooks_col, get_sections_col, get_pages_col, get_canvas_blocks_col, get_permissions_col

router = APIRouter(prefix="/api/notebooks", tags=["notebooks"])

@router.get("")
async def list_notebooks(current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_notebooks_col()
    # Find notebooks owned by user or shared with user
    notebooks = await col.find({"owner_id": current_user["id"], "is_deleted": False})
    
    # If user has no notebooks yet, initialize a rich welcome notebook
    if len(notebooks) == 0:
        default_nb = {
            "id": "nb-welcome-01",
            "owner_id": current_user["id"],
            "title": "My Notebook",
            "color": "#6941A5",
            "description": "Your main knowledge workspace in Europa",
            "is_archived": False,
            "is_deleted": False,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        await col.insert_one(default_nb)
        
        # Create initial section
        sec_col = get_sections_col()
        welcome_sec = {
            "id": "sec-welcome-01",
            "notebook_id": default_nb["id"],
            "section_group_id": None,
            "title": "Quick Notes",
            "color": "#6941A5",
            "order": 0,
            "is_locked": False,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        await sec_col.insert_one(welcome_sec)
        
        # Create initial page
        page_col = get_pages_col()
        welcome_page = {
            "id": "page-welcome-01",
            "section_id": welcome_sec["id"],
            "notebook_id": default_nb["id"],
            "title": "Welcome to Europa",
            "parent_page_id": None,
            "order": 0,
            "is_pinned": True,
            "is_favorite": True,
            "is_deleted": False,
            "background_color": "#FFFFFF",
            "paper_style": "ruled",
            "rule_spacing": 32,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        await page_col.insert_one(welcome_page)
        
        # Create initial blocks
        blocks_col = get_canvas_blocks_col()
        b1 = {
            "id": "block-w1",
            "page_id": welcome_page["id"],
            "block_type": "text",
            "x": 60,
            "y": 40,
            "width": 640,
            "height": 220,
            "layer_order": 0,
            "content": "<h1>Welcome to Europa</h1><p>A digital notebook and AI knowledge workspace by <strong>AkashaVyom Labs</strong>, inspired by Microsoft OneNote.</p><p>Unlike ordinary word processors, Europa gives you a <strong>free-form canvas</strong>: click anywhere to start typing, draw with ink, insert tables, checklists, and chat with your notebook AI.</p>",
            "formatting": {},
            "is_locked": False,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        b2 = {
            "id": "block-w2",
            "page_id": welcome_page["id"],
            "block_type": "checklist",
            "x": 60,
            "y": 280,
            "width": 380,
            "height": 200,
            "layer_order": 1,
            "content": [
                {"text": "Click anywhere on the canvas to place a new note container", "checked": True},
                {"text": "Drag note containers around with their top handle bar", "checked": False},
                {"text": "Switch to the Draw tab to sketch or highlight", "checked": False},
                {"text": "Open the AI Assistant (Ctrl+J or top ribbon) to summarize notes", "checked": False}
            ],
            "formatting": {},
            "is_locked": False,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        b3 = {
            "id": "block-w3",
            "page_id": welcome_page["id"],
            "block_type": "callout",
            "x": 480,
            "y": 280,
            "width": 340,
            "height": 180,
            "layer_order": 2,
            "content": "💡 <strong>Tip</strong>: Use the <strong>View</strong> tab to switch between Ruled, Grid, Dotted, or Blank paper, and adjust rule line spacing!",
            "formatting": {"backgroundColor": "#F0EAF8", "borderColor": "#6941A5"},
            "is_locked": False,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        await blocks_col.insert_one(b1)
        await blocks_col.insert_one(b2)
        await blocks_col.insert_one(b3)
        
        notebooks = [default_nb]
        
    return notebooks

@router.post("")
async def create_notebook(nb_in: NotebookCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_notebooks_col()
    nb = Notebook(
        owner_id=current_user["id"],
        title=nb_in.title,
        color=nb_in.color or "#6941A5",
        description=nb_in.description or ""
    )
    doc = nb.model_dump()
    await col.insert_one(doc)
    
    # Create a default section and page
    sec_col = get_sections_col()
    sec = {
        "id": f"sec_{int(datetime.utcnow().timestamp()*1000)}",
        "notebook_id": doc["id"],
        "section_group_id": None,
        "title": "New Section 1",
        "color": doc["color"],
        "order": 0,
        "is_locked": False,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
    await sec_col.insert_one(sec)
    
    page_col = get_pages_col()
    page = {
        "id": f"page_{int(datetime.utcnow().timestamp()*1000)}",
        "section_id": sec["id"],
        "notebook_id": doc["id"],
        "title": "Untitled Page",
        "parent_page_id": None,
        "order": 0,
        "is_pinned": False,
        "is_favorite": False,
        "is_deleted": False,
        "background_color": "#FFFFFF",
        "paper_style": "ruled",
        "rule_spacing": 32,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
    await page_col.insert_one(page)
    
    return doc

@router.get("/{notebook_id}")
async def get_notebook(notebook_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_notebooks_col()
    nb = await col.find_one({"id": notebook_id})
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return nb

@router.put("/{notebook_id}")
async def update_notebook(notebook_id: str, nb_in: NotebookUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_notebooks_col()
    nb = await col.find_one({"id": notebook_id})
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    update_data = {k: v for k, v in nb_in.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat() + "Z"
    
    await col.update_one({"id": notebook_id}, {"$set": update_data})
    updated = await col.find_one({"id": notebook_id})
    return updated

@router.delete("/{notebook_id}")
async def delete_notebook(notebook_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_notebooks_col()
    nb = await col.find_one({"id": notebook_id})
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    # Mark as deleted (soft delete for restoration)
    await col.update_one({"id": notebook_id}, {"$set": {"is_deleted": True, "updated_at": datetime.utcnow().isoformat() + "Z"}})
    return {"status": "success", "message": "Notebook marked as deleted"}

@router.post("/{notebook_id}/restore")
async def restore_notebook(notebook_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_notebooks_col()
    await col.update_one({"id": notebook_id}, {"$set": {"is_deleted": False, "updated_at": datetime.utcnow().isoformat() + "Z"}})
    return {"status": "success", "message": "Notebook restored"}

@router.post("/{notebook_id}/duplicate")
async def duplicate_notebook(notebook_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_notebooks_col()
    nb = await col.find_one({"id": notebook_id})
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    new_nb = nb.copy()
    new_nb["id"] = f"nb_{int(datetime.utcnow().timestamp()*1000)}"
    new_nb["title"] = f"{nb['title']} (Copy)"
    new_nb["created_at"] = datetime.utcnow().isoformat() + "Z"
    new_nb["updated_at"] = datetime.utcnow().isoformat() + "Z"
    await col.insert_one(new_nb)
    
    # Duplicate sections and pages
    sec_col = get_sections_col()
    page_col = get_pages_col()
    blocks_col = get_canvas_blocks_col()
    
    sections = await sec_col.find({"notebook_id": notebook_id})
    for sec in sections:
        new_sec = sec.copy()
        new_sec["id"] = f"sec_{int(datetime.utcnow().timestamp()*1000)}_{sec['id'][-4:]}"
        new_sec["notebook_id"] = new_nb["id"]
        await sec_col.insert_one(new_sec)
        
        pages = await page_col.find({"section_id": sec["id"]})
        for page in pages:
            new_page = page.copy()
            new_page["id"] = f"page_{int(datetime.utcnow().timestamp()*1000)}_{page['id'][-4:]}"
            new_page["section_id"] = new_sec["id"]
            new_page["notebook_id"] = new_nb["id"]
            await page_col.insert_one(new_page)
            
            blocks = await blocks_col.find({"page_id": page["id"]})
            for block in blocks:
                new_block = block.copy()
                new_block["id"] = f"blk_{int(datetime.utcnow().timestamp()*1000)}_{block['id'][-4:]}"
                new_block["page_id"] = new_page["id"]
                await blocks_col.insert_one(new_block)
                
    return new_nb

@router.post("/{notebook_id}/share")
async def share_notebook(notebook_id: str, payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    perm_col = get_permissions_col()
    recipient_email = payload.get("email")
    role = payload.get("role", "editor") # editor | commenter | viewer
    
    perm = {
        "id": f"perm_{int(datetime.utcnow().timestamp()*1000)}",
        "notebook_id": notebook_id,
        "user_email": recipient_email,
        "role": role,
        "invited_by": current_user["id"],
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    await perm_col.insert_one(perm)
    return {"status": "success", "share_url": f"/notebooks/{notebook_id}?invite={perm['id']}", "permission": perm}

