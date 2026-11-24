from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
import re
from backend.auth import get_current_user
from backend.database import get_notebooks_col, get_sections_col, get_pages_col, get_canvas_blocks_col, get_tags_col

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("")
async def search_notes(
    q: str = Query(..., min_length=1),
    scope: str = Query("all"), # current_page | current_section | current_notebook | all
    page_id: Optional[str] = None,
    section_id: Optional[str] = None,
    notebook_id: Optional[str] = None,
    tag: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    query_text = q.lower()
    results = []
    
    pages_col = get_pages_col()
    sections_col = get_sections_col()
    notebooks_col = get_notebooks_col()
    blocks_col = get_canvas_blocks_col()
    
    # 1. Determine eligible notebooks
    user_notebooks = await notebooks_col.find({"owner_id": current_user["id"], "is_deleted": False})
    user_nb_ids = {nb["id"]: nb["title"] for nb in user_notebooks}
    
    if notebook_id and notebook_id in user_nb_ids:
        eligible_nb_ids = {notebook_id: user_nb_ids[notebook_id]}
    else:
        eligible_nb_ids = user_nb_ids

    # 2. Search Notebook titles
    if scope in ["all"]:
        for nbid, nbtitle in eligible_nb_ids.items():
            if query_text in nbtitle.lower():
                results.append({
                    "type": "notebook",
                    "notebook_id": nbid,
                    "notebook_title": nbtitle,
                    "title": nbtitle,
                    "snippet": f"Notebook matching: '{nbtitle}'",
                    "match_type": "Notebook Name"
                })

    # 3. Search Sections
    all_sections = []
    for nbid in eligible_nb_ids.keys():
        secs = await sections_col.find({"notebook_id": nbid})
        all_sections.extend(secs)
        
    sec_map = {s["id"]: s for s in all_sections}
    if scope in ["all", "current_notebook"]:
        for s in all_sections:
            if section_id and s["id"] != section_id:
                continue
            if query_text in s["title"].lower():
                nb_title = eligible_nb_ids.get(s["notebook_id"], "")
                results.append({
                    "type": "section",
                    "notebook_id": s["notebook_id"],
                    "notebook_title": nb_title,
                    "section_id": s["id"],
                    "section_title": s["title"],
                    "title": s["title"],
                    "snippet": f"Section in {nb_title}: '{s['title']}'",
                    "match_type": "Section Name"
                })

    # 4. Search Pages and Canvas Blocks
    for s in all_sections:
        if section_id and s["id"] != section_id:
            continue
        pages = await pages_col.find({"section_id": s["id"], "is_deleted": False})
        for p in pages:
            if page_id and p["id"] != page_id:
                continue
            
            # Match Page Title
            if query_text in p["title"].lower():
                results.append({
                    "type": "page",
                    "notebook_id": s["notebook_id"],
                    "notebook_title": eligible_nb_ids.get(s["notebook_id"], ""),
                    "section_id": s["id"],
                    "section_title": s["title"],
                    "page_id": p["id"],
                    "page_title": p["title"],
                    "title": p["title"],
                    "snippet": f"Page: {p['title']}",
                    "match_type": "Page Title"
                })
                
            # Match Blocks Content inside this page
            blocks = await blocks_col.find({"page_id": p["id"]})
            for b in blocks:
                content_str = ""
                raw_c = b.get("content", "")
                if isinstance(raw_c, str):
                    content_str = re.sub(r'<[^>]+>', ' ', raw_c) # strip html
                elif isinstance(raw_c, list):
                    content_str = " ".join([item.get("text", "") for item in raw_c if isinstance(item, dict)])
                elif isinstance(raw_c, dict):
                    content_str = json.dumps(raw_c)
                    
                if query_text in content_str.lower():
                    # extract snippet with context
                    idx = content_str.lower().find(query_text)
                    start = max(0, idx - 40)
                    end = min(len(content_str), idx + len(query_text) + 40)
                    snippet = "..." + content_str[start:end].strip() + "..."
                    
                    results.append({
                        "type": "block",
                        "block_id": b["id"],
                        "block_type": b.get("block_type", "text"),
                        "notebook_id": s["notebook_id"],
                        "notebook_title": eligible_nb_ids.get(s["notebook_id"], ""),
                        "section_id": s["id"],
                        "section_title": s["title"],
                        "page_id": p["id"],
                        "page_title": p["title"],
                        "title": p["title"],
                        "snippet": snippet,
                        "match_type": f"Note Content ({b.get('block_type', 'text')})"
                    })
                    
    return {"query": q, "scope": scope, "total": len(results), "results": results}

