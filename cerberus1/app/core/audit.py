import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.sql_models import AuditLog

logger = logging.getLogger(__name__)

def log_audit(
    db: Session,
    action: str,
    user_id: Optional[str] = "investigator-01",
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = "127.0.0.1"
):
    try:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details_json=details or {},
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to record audit log: {e}")
        db.rollback()
