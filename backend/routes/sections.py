from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.models import Section, SectionCreate, SectionUpdate, SectionGroup, SectionGroupCreate
from backend.auth import get_current_user, hash_password, verify_password
from backend.database import get_sections_col, get_section_groups_col, get_pages_col

router = APIRouter(prefix="/api", tags=["sections"])

# Section Groups
@router.get("/notebooks/{notebook_id}/section-groups")
async def list_section_groups(notebook_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_section_groups_col()
    return await col.find({"notebook_id": notebook_id})

@router.post("/section-groups")
async def create_section_group(sg_in: SectionGroupCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_section_groups_col()
    sg = SectionGroup(**sg_in.model_dump())
    doc = sg.model_dump()
    await col.insert_one(doc)
    return doc

# Sections
@router.get("/notebooks/{notebook_id}/sections")
async def list_sections(notebook_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_sections_col()
    sections = await col.find({"notebook_id": notebook_id})
    # Sanitize password hash before returning
    safe_sections = []
    for s in sections:
        sc = s.copy()
        sc["has_password"] = bool(sc.get("password_hash"))
        sc.pop("password_hash", None)
        safe_sections.append(sc)
    return safe_sections

@router.post("/sections")
async def create_section(sec_in: SectionCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_sections_col()
    sec_data = sec_in.model_dump()
    pwd = sec_data.pop("password", None)
    
    sec = Section(
        notebook_id=sec_in.notebook_id,
        section_group_id=sec_in.section_group_id,
        title=sec_in.title,
        color=sec_in.color or "#6941A5",
        password_hash=hash_password(pwd) if pwd else None,
        is_locked=bool(pwd)
    )
    doc = sec.model_dump()
    await col.insert_one(doc)
    
    # Also create a default page in this section
    pages_col = get_pages_col()
    page = {
        "id": f"page_{int(datetime.utcnow().timestamp()*1000)}",
        "section_id": doc["id"],
        "notebook_id": doc["notebook_id"],
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
    await pages_col.insert_one(page)
    
    res = doc.copy()
    res["has_password"] = bool(pwd)
    res.pop("password_hash", None)
    return res

@router.put("/sections/{section_id}")
async def update_section(section_id: str, sec_in: SectionUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_sections_col()
    sec = await col.find_one({"id": section_id})
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    
    data = sec_in.model_dump(exclude_unset=True)
    if "password" in data:
        pwd = data.pop("password")
        if pwd:
            data["password_hash"] = hash_password(pwd)
            data["is_locked"] = True
        else:
            data["password_hash"] = None
            data["is_locked"] = False
            
    data["updated_at"] = datetime.utcnow().isoformat() + "Z"
    await col.update_one({"id": section_id}, {"$set": data})
    
    updated = await col.find_one({"id": section_id})
    res = updated.copy()
    res["has_password"] = bool(res.get("password_hash"))
    res.pop("password_hash", None)
    return res

@router.post("/sections/{section_id}/verify-password")
async def verify_section_password(section_id: str, payload: Dict[str, str]):
    col = get_sections_col()
    sec = await col.find_one({"id": section_id})
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    
    pwd_hash = sec.get("password_hash")
    if not pwd_hash:
        return {"unlocked": True}
        
    password = payload.get("password", "")
    if verify_password(password, pwd_hash):
        return {"unlocked": True}
    else:
        raise HTTPException(status_code=401, detail="Incorrect section password")

@router.delete("/sections/{section_id}")
async def delete_section(section_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_sections_col()
    await col.delete_one({"id": section_id})
    return {"status": "success"}

