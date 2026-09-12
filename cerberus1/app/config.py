import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "CyberSaarthi Module 1 - Data Intelligence Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cybersaarthi_dev_secret_key_2026_super_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Databases
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR}/data/cybersaarthi.db"
    )
    
    # Neo4j
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "cybersaarthi_graph_pass")
    NEO4J_ENABLED: bool = os.getenv("NEO4J_ENABLED", "true").lower() in ("true", "1", "yes")
    
    # Storage
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", str(BASE_DIR / "data" / "uploads"))
    
    # AI & OCR
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "heuristic") # "heuristic", "openai", "gemini"
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    OCR_ENGINE: str = os.getenv("OCR_ENGINE", "auto") # "auto", "pdfplumber", "easyocr", "tesseract"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

settings = Settings()

# Ensure directories exist
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
os.makedirs(os.path.dirname(settings.DATABASE_URL.replace("sqlite:///", "")), exist_ok=True) if settings.DATABASE_URL.startswith("sqlite:///") else None
