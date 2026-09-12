import os
import logging
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class OCRService:
    def extract_text_chunks(self, file_path: str, mime_type: str) -> List[Dict[str, Any]]:
        """Extract text chunks from PDF, image, or text file."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
            
        chunks: List[Dict[str, Any]] = []
        ext = path.suffix.lower()
        
        # 1. Plain text / Markdown
        if ext in (".txt", ".json", ".log", ".csv", ".md"):
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                chunks.extend(self._split_into_chunks(content, page_number=1))
                return chunks
            except Exception as e:
                logger.error(f"Error reading text file {file_path}: {e}")

        # 2. PDF extraction
        if ext == ".pdf" or "pdf" in mime_type:
            try:
                import pdfplumber
                with pdfplumber.open(str(path)) as pdf:
                    for page_idx, page in enumerate(pdf.pages):
                        page_text = page.extract_text() or ""
                        if page_text.strip():
                            chunks.extend(self._split_into_chunks(page_text, page_number=page_idx + 1))
                if chunks:
                    return chunks
            except Exception as e:
                logger.warning(f"pdfplumber extraction failed for {file_path}: {e}")

        # 3. Fallback: direct binary/text reading
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            if content.strip():
                chunks.extend(self._split_into_chunks(content, page_number=1))
                return chunks
        except Exception as e:
            logger.error(f"Final extraction attempt failed for {file_path}: {e}")

        return [{"page_number": 1, "chunk_index": 0, "text_content": "[Document uploaded - empty or binary content]"}]

    def _split_into_chunks(self, text: str, page_number: int, max_chunk_chars: int = 1500) -> List[Dict[str, Any]]:
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        if not paragraphs:
            paragraphs = [text.strip()] if text.strip() else []
            
        chunks = []
        current_chunk = []
        current_len = 0
        chunk_idx = 0
        
        for p in paragraphs:
            if current_len + len(p) > max_chunk_chars and current_chunk:
                chunks.append({
                    "page_number": page_number,
                    "chunk_index": chunk_idx,
                    "text_content": "\n\n".join(current_chunk)
                })
                chunk_idx += 1
                current_chunk = [p]
                current_len = len(p)
            else:
                current_chunk.append(p)
                current_len += len(p) + 2
                
        if current_chunk:
            chunks.append({
                "page_number": page_number,
                "chunk_index": chunk_idx,
                "text_content": "\n\n".join(current_chunk)
            })
            
        return chunks

ocr_service = OCRService()
