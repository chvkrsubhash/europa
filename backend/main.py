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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8001, reload=True)

