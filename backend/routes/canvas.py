from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.models import CanvasBlock, CanvasBlockCreate, CanvasBlockUpdate, InkStroke, InkStrokeCreate
from backend.auth import get_current_user
from backend.database import get_canvas_blocks_col, get_ink_strokes_col, get_pages_col

router = APIRouter(prefix="/api", tags=["canvas"])

# Canvas Blocks
@router.get("/pages/{page_id}/blocks")
async def get_page_blocks(page_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_canvas_blocks_col()
    blocks = await col.find({"page_id": page_id})
    return blocks

@router.post("/pages/{page_id}/blocks")
async def create_canvas_block(page_id: str, block_in: CanvasBlockCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_canvas_blocks_col()
    block = CanvasBlock(
        page_id=page_id,
        block_type=block_in.block_type,
        x=block_in.x,
        y=block_in.y,
        width=block_in.width,
        height=block_in.height,
        layer_order=block_in.layer_order,
        content=block_in.content,
        formatting=block_in.formatting,
        is_locked=block_in.is_locked
    )
    doc = block.model_dump()
    await col.insert_one(doc)
    
    # Touch page updated_at
    page_col = get_pages_col()
    await page_col.update_one({"id": page_id}, {"$set": {"updated_at": datetime.utcnow().isoformat() + "Z"}})
    return doc

@router.put("/blocks/{block_id}")
async def update_canvas_block(block_id: str, block_in: CanvasBlockUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_canvas_blocks_col()
    block = await col.find_one({"id": block_id})
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
        
    data = {k: v for k, v in block_in.model_dump().items() if v is not None}
    data["updated_at"] = datetime.utcnow().isoformat() + "Z"
    await col.update_one({"id": block_id}, {"$set": data})
    
    return await col.find_one({"id": block_id})

@router.delete("/blocks/{block_id}")
async def delete_canvas_block(block_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_canvas_blocks_col()
    await col.delete_one({"id": block_id})
    return {"status": "success"}

@router.post("/pages/{page_id}/blocks/batch")
async def batch_update_blocks(page_id: str, payload: Dict[str, List[Dict[str, Any]]], current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_canvas_blocks_col()
    updates = payload.get("blocks", [])
    for b in updates:
        bid = b.get("id")
        if bid:
            b_data = {k: v for k, v in b.items() if k not in ["id", "page_id"]}
            b_data["updated_at"] = datetime.utcnow().isoformat() + "Z"
            await col.update_one({"id": bid, "page_id": page_id}, {"$set": b_data})
    return {"status": "success", "updated_count": len(updates)}

# Digital Ink Strokes
@router.get("/pages/{page_id}/ink")
async def get_page_ink_strokes(page_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_ink_strokes_col()
    return await col.find({"page_id": page_id})

@router.post("/pages/{page_id}/ink")
async def add_ink_stroke(page_id: str, stroke_in: InkStrokeCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_ink_strokes_col()
    stroke = InkStroke(
        page_id=page_id,
        tool=stroke_in.tool,
        points=stroke_in.points,
        color=stroke_in.color,
        thickness=stroke_in.thickness,
        opacity=stroke_in.opacity
    )
    doc = stroke.model_dump()
    await col.insert_one(doc)
    return doc

@router.delete("/ink/{stroke_id}")
async def delete_ink_stroke(stroke_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_ink_strokes_col()
    await col.delete_one({"id": stroke_id})
    return {"status": "success"}

@router.post("/pages/{page_id}/ink/clear")
async def clear_page_ink(page_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_ink_strokes_col()
    await col.delete_many({"page_id": page_id})
    return {"status": "success"}

