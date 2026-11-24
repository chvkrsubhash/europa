from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Dict, Any
import os
import shutil
import uuid
from backend.config import settings
from backend.auth import get_current_user

router = APIRouter(prefix="/api/files", tags=["files"])

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: Dict[str, Any] = Depends(get_current_user)):
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"{uuid.uuid4()}{ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_url = f"/api/files/download/{filename}"
    return {
        "filename": file.filename,
        "saved_as": filename,
        "url": file_url,
        "size": os.path.getsize(dest_path),
        "content_type": file.content_type
    }

@router.get("/download/{filename}")
async def get_uploaded_file(filename: str):
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    from fastapi.responses import FileResponse
    return FileResponse(file_path)

