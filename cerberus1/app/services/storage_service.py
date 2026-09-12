import os
import hashlib
import aiofiles
from pathlib import Path
from fastapi import UploadFile
from app.config import settings

class StorageService:
    def __init__(self, storage_dir: str = settings.STORAGE_DIR):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, file: UploadFile) -> dict:
        """Save file immutably and compute its SHA-256 checksum."""
        content = await file.read()
        sha256_hash = hashlib.sha256(content).hexdigest()
        
        # Preserve original extension
        ext = Path(file.filename or "").suffix
        stored_filename = f"{sha256_hash}{ext}"
        destination = self.storage_dir / stored_filename
        
        if not destination.exists():
            async with aiofiles.open(destination, "wb") as f:
                await f.write(content)
                
        return {
            "file_path": str(destination),
            "file_hash": sha256_hash,
            "file_size": len(content),
            "mime_type": file.content_type or "application/octet-stream",
            "filename": file.filename or stored_filename
        }

    def save_bytes(self, content: bytes, original_filename: str, mime_type: str = "text/plain") -> dict:
        sha256_hash = hashlib.sha256(content).hexdigest()
        ext = Path(original_filename).suffix
        stored_filename = f"{sha256_hash}{ext}"
        destination = self.storage_dir / stored_filename
        
        if not destination.exists():
            with open(destination, "wb") as f:
                f.write(content)
                
        return {
            "file_path": str(destination),
            "file_hash": sha256_hash,
            "file_size": len(content),
            "mime_type": mime_type,
            "filename": original_filename
        }

storage_service = StorageService()
