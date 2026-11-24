import os
from typing import Optional

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "Europa")
    APP_TAGLINE: str = os.getenv("APP_TAGLINE", "Digital Notebook & Knowledge Workspace")
    BRAND_NAME: str = os.getenv("BRAND_NAME", "AkashaVyom Labs")
    VERSION: str = "1.0.0"
    
    # Environment
    ENV: str = os.getenv("ENV", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "akashavyom-europa-secret-key-2026-super-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # MongoDB
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "europa_notebook_db")
    
    # AI Providers Configuration
    DEFAULT_AI_PROVIDER: str = os.getenv("DEFAULT_AI_PROVIDER", "gemini") # gemini | groq | openrouter | ollama
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", None)
    OPENROUTER_API_KEY: Optional[str] = os.getenv("OPENROUTER_API_KEY", None)
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    # Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(__file__), "uploads")
    LOCAL_STORAGE_DIR: str = os.path.join(os.path.dirname(__file__), "data_store")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)
