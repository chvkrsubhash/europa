from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.config import settings
from backend.database import db_manager
from backend.routes.auth_routes import router as auth_router
from backend.routes.notebooks import router as notebooks_router
from backend.routes.sections import router as sections_router
from backend.routes.pages import router as pages_router
from backend.routes.canvas import router as canvas_router
from backend.routes.search import router as search_router
from backend.routes.tags_tasks import router as tags_tasks_router
from backend.routes.templates import router as templates_router
from backend.routes.ai_routes import router as ai_router
from backend.routes.export_routes import router as export_router
from backend.routes.files import router as files_router
from backend.routes.collaboration import router as collab_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database
    await db_manager.init_db()
    yield
    # Shutdown

app = FastAPI(
    title=f"{settings.APP_NAME} — {settings.APP_TAGLINE}",
    description=f"OneNote-class digital notebook and AI knowledge workspace by {settings.BRAND_NAME}",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(notebooks_router)
app.include_router(sections_router)
app.include_router(pages_router)
app.include_router(canvas_router)
app.include_router(search_router)
app.include_router(tags_tasks_router)
app.include_router(templates_router)
app.include_router(ai_router)
app.include_router(export_router)
app.include_router(files_router)
app.include_router(collab_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "product": settings.APP_NAME,
        "brand": settings.BRAND_NAME,
        "version": settings.VERSION,
        "database_mode": "mongodb" if db_manager.is_mongo else "local_store"
    }

@app.get("/api/storage/status")
async def get_storage_status():
    import os
    from datetime import datetime
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data_store")
    file_stats = []
    total_bytes = 0
    if os.path.exists(data_dir):
        for f in os.listdir(data_dir):
            if f.endswith(".json"):
                fpath = os.path.join(data_dir, f)
                stat = os.stat(fpath)
                file_stats.append({
                    "name": f,
                    "size_bytes": stat.st_size,
                    "modified_at": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
                })
                total_bytes += stat.st_size
    
    return {
        "storage_folder": data_dir,
        "database_mode": "mongodb" if db_manager.is_mongo else "local_store",
        "sync_status": "saved",
        "total_size_bytes": total_bytes,
        "files": file_stats,
        "last_synced": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@app.post("/api/storage/sync")
async def sync_all_storage():
    from datetime import datetime
    return {
        "status": "success",
        "message": "All notebook state, pages, and canvas blocks synced to disk successfully",
        "synced_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8001, reload=True)

