import difflib
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.sql_models import Entity, CaseEntity, EntityMatch, Case
from app.services.normalizer_service import normalizer_service
from app.schemas.extraction import AIExtractionContract
from app.core.audit import log_audit

logger = logging.getLogger(__name__)

class ResolutionService:
    @staticmethod
    def calculate_name_similarity(name1: str, name2: str) -> float:
        """Calculate string similarity between two names, handling initials like 'R. Kumar' vs 'Rahul Kumar'."""
        n1 = name1.lower().strip()
        n2 = name2.lower().strip()
        if n1 == n2:
            return 1.0
            
        # Initial check (e.g. "R. Kumar" vs "Rahul Kumar")
        p1 = [p.strip(".") for p in n1.split()]
        p2 = [p.strip(".") for p in n2.split()]
        
        if len(p1) > 1 and len(p2) > 1:
            # Check if last names match and first initial matches
            if p1[-1] == p2[-1]:
                if p1[0] == p2[0] or p1[0][0] == p2[0][0]:
                    return 0.88
                    
        return difflib.SequenceMatcher(None, n1, n2).ratio()

    def process_and_persist_approved_extraction(
        self,
        db: Session,
        case_id: str,
        extraction_id: str,
        contract: AIExtractionContract
    ) -> List[Entity]:
        """Persist entities from approved extraction, normalize them, link to case, and generate match candidates."""
        created_or_found_entities: List[Entity] = []
        created_person_entities: List[Entity] = []

        # 1. Process Persons
        for p in contract.persons:
            canonical = normalizer_service.normalize_person_name(p.name)
            # Find or create person
            entity = db.query(Entity).filter(
                Entity.type == "PERSON",
                Entity.canonical_name == canonical
            ).first()
            
            if not entity:
                entity = Entity(
                    type="PERSON",
                    raw_value=p.name,
                    canonical_name=canonical,
                    normalized_value=canonical.lower(),
                    metadata_json={"role": p.role, "aliases": p.aliases or []}
                )
                db.add(entity)
                db.flush()
                
            # Link to CaseEntity
            case_entity = db.query(CaseEntity).filter(
                CaseEntity.case_id == case_id,
                CaseEntity.entity_id == entity.id
            ).first()
            if not case_entity:
                case_entity = CaseEntity(
                    case_id=case_id,
                    entity_id=entity.id,
                    role=p.role,
                    confidence=1.0,
                    source="AI_EXTRACTION",
                    extraction_id=extraction_id,
                    is_approved=True
                )
                db.add(case_entity)
            
            created_or_found_entities.append(entity)
            created_person_entities.append(entity)

        # 2. Process Phones
        for ph in contract.phones:
            norm_val = normalizer_service.normalize_phone(ph.value)
            entity = db.query(Entity).filter(
                Entity.type == "PHONE",
                Entity.normalized_value == norm_val
            ).first()
            if not entity:
                entity = Entity(
                    type="PHONE",
                    raw_value=ph.value,
                    canonical_name=norm_val,
                    normalized_value=norm_val,
                    metadata_json={"owner_name": ph.owner_name}
                )
                db.add(entity)
                db.flush()
                
            case_entity = db.query(CaseEntity).filter(
                CaseEntity.case_id == case_id,
                CaseEntity.entity_id == entity.id
            ).first()
            if not case_entity:
                case_entity = CaseEntity(
                    case_id=case_id,
                    entity_id=entity.id,
                    role="COMMUNICATION",
                    source="AI_EXTRACTION",
                    extraction_id=extraction_id
                )
                db.add(case_entity)
            created_or_found_entities.append(entity)

        # 3. Process Vehicles
        for v in contract.vehicles:
            norm_val = normalizer_service.normalize_vehicle(v.registration)
            entity = db.query(Entity).filter(
                Entity.type == "VEHICLE",
                Entity.normalized_value == norm_val
            ).first()
            if not entity:
                entity = Entity(
                    type="VEHICLE",
                    raw_value=v.registration,
                    canonical_name=norm_val,
                    normalized_value=norm_val,
                    metadata_json={"make_model": v.make_model}
                )
                db.add(entity)
                db.flush()
                
            case_entity = db.query(CaseEntity).filter(
                CaseEntity.case_id == case_id,
                CaseEntity.entity_id == entity.id
            ).first()
            if not case_entity:
                case_entity = CaseEntity(
                    case_id=case_id,
                    entity_id=entity.id,
                    role="TRANSPORT",
                    source="AI_EXTRACTION",
                    extraction_id=extraction_id
                )
                db.add(case_entity)
            created_or_found_entities.append(entity)

        # 4. Process UPIs
        for u in contract.upis:
            norm_val = normalizer_service.normalize_upi(u.value)
            entity = db.query(Entity).filter(
                Entity.type == "UPI",
                Entity.normalized_value == norm_val
            ).first()
            if not entity:
                entity = Entity(
                    type="UPI",
                    raw_value=u.value,
                    canonical_name=norm_val,
                    normalized_value=norm_val,
                    metadata_json={"holder_name": u.holder_name}
                )
                db.add(entity)
                db.flush()
                
            case_entity = db.query(CaseEntity).filter(
                CaseEntity.case_id == case_id,
                CaseEntity.entity_id == entity.id
            ).first()
            if not case_entity:
                case_entity = CaseEntity(
                    case_id=case_id,
                    entity_id=entity.id,
                    role="FINANCIAL_IDENTIFIER",
                    source="AI_EXTRACTION",
                    extraction_id=extraction_id
                )
                db.add(case_entity)
            created_or_found_entities.append(entity)

        # 5. Process Bank Accounts
        for b in contract.bank_accounts:
            norm_val, masked = normalizer_service.normalize_bank_account(b.account_number)
            entity = db.query(Entity).filter(
                Entity.type == "BANK_ACCOUNT",
                Entity.normalized_value == norm_val
            ).first()
            if not entity:
                entity = Entity(
                    type="BANK_ACCOUNT",
                    raw_value=b.account_number,
                    canonical_name=masked,
                    normalized_value=norm_val,
                    metadata_json={"ifsc": b.ifsc, "bank_name": b.bank_name}
                )
                db.add(entity)
                db.flush()
                
            case_entity = db.query(CaseEntity).filter(
                CaseEntity.case_id == case_id,
                CaseEntity.entity_id == entity.id
            ).first()
            if not case_entity:
                case_entity = CaseEntity(
                    case_id=case_id,
                    entity_id=entity.id,
                    role="FINANCIAL_ACCOUNT",
                    source="AI_EXTRACTION",
                    extraction_id=extraction_id
                )
                db.add(case_entity)
            created_or_found_entities.append(entity)

        # 6. Process Locations
        for loc in contract.locations:
            norm_val = normalizer_service.normalize_location(loc.name)
            entity = db.query(Entity).filter(
                Entity.type == "LOCATION",
                Entity.canonical_name == norm_val
            ).first()
            if not entity:
                entity = Entity(
                    type="LOCATION",
                    raw_value=loc.name,
                    canonical_name=norm_val,
                    normalized_value=norm_val.lower(),
                    metadata_json={"coordinates": loc.coordinates}
                )
                db.add(entity)
                db.flush()
            created_or_found_entities.append(entity)

        # 7. Process Organizations
        for org in contract.organizations:
            norm_val = normalizer_service.normalize_organization(org.name)
            entity = db.query(Entity).filter(
                Entity.type == "ORGANIZATION",
                Entity.canonical_name == norm_val
            ).first()
            if not entity:
                entity = Entity(
                    type="ORGANIZATION",
                    raw_value=org.name,
                    canonical_name=norm_val,
                    normalized_value=norm_val.lower(),
                    metadata_json={"registration_id": org.registration_id}
                )
                db.add(entity)
                db.flush()
            created_or_found_entities.append(entity)

        db.commit()

        # 8. Run Resolution & Candidate Match Generation
        self.generate_match_candidates_for_case(db, case_id)

        return created_or_found_entities

    def generate_match_candidates_for_case(self, db: Session, case_id: str):
        """Cross-case entity candidate resolution as specified in Section 6."""
        # Find all persons in this case
        case_persons = (
            db.query(Entity)
            .join(CaseEntity, CaseEntity.entity_id == Entity.id)
            .filter(CaseEntity.case_id == case_id, Entity.type == "PERSON")
            .all()
        )

        # Find other persons across all other cases
        other_persons = (
            db.query(Entity)
            .join(CaseEntity, CaseEntity.entity_id == Entity.id)
            .filter(CaseEntity.case_id != case_id, Entity.type == "PERSON")
            .all()
        )

        for cp in case_persons:
            # Fetch cp's associated phones, vehicles, bank accounts, upis
            cp_identifiers = self._get_person_identifiers(db, cp.id)
            
            for op in other_persons:
                if cp.id == op.id:
                    continue
                    
                # Check if match candidate already exists
                existing_match = db.query(EntityMatch).filter(
                    or_(
                        (EntityMatch.source_entity_id == cp.id) & (EntityMatch.target_entity_id == op.id),
                        (EntityMatch.source_entity_id == op.id) & (EntityMatch.target_entity_id == cp.id)
                    )
                ).first()
                if existing_match:
                    continue

                op_identifiers = self._get_person_identifiers(db, op.id)
                reasons = []
                score = 0.0

                # Check shared strong identifiers (Phone, UPI, Vehicle, BankAccount)
                shared_phones = cp_identifiers["phones"].intersection(op_identifiers["phones"])
                if shared_phones:
                    score += 0.70
                    reasons.append(f"Shares phone number(s): {', '.join(shared_phones)}")

                shared_upis = cp_identifiers["upis"].intersection(op_identifiers["upis"])
                if shared_upis:
                    score += 0.65
                    reasons.append(f"Shares UPI address: {', '.join(shared_upis)}")

                shared_banks = cp_identifiers["bank_accounts"].intersection(op_identifiers["bank_accounts"])
                if shared_banks:
                    score += 0.75
                    reasons.append(f"Shares bank account identifier")

                shared_vehs = cp_identifiers["vehicles"].intersection(op_identifiers["vehicles"])
                if shared_vehs:
                    score += 0.60
                    reasons.append(f"Shares vehicle registration: {', '.join(shared_vehs)}")

                # Name similarity score
                name_sim = self.calculate_name_similarity(cp.canonical_name, op.canonical_name)
                if name_sim >= 0.75:
                    score += (name_sim * 0.30)
                    reasons.append(f"Name similarity {int(name_sim*100)}% between '{cp.canonical_name}' and '{op.canonical_name}'")

                # If score reaches threshold, create SUGGESTED match
                final_score = min(round(score, 2), 0.99)
                if final_score >= 0.50:
                    match_record = EntityMatch(
                        source_entity_id=cp.id,
                        target_entity_id=op.id,
                        match_type="SHARED_IDENTIFIER" if (shared_phones or shared_upis or shared_banks) else "FUZZY",
                        score=final_score,
                        match_reasons_json=reasons,
                        status="SUGGESTED"
                    )
                    db.add(match_record)
        
        db.commit()

    def _get_person_identifiers(self, db: Session, person_id: str) -> Dict[str, set]:
        # Get cases person is involved in
        case_ids = [ce.case_id for ce in db.query(CaseEntity).filter(CaseEntity.entity_id == person_id).all()]
        
        # Get all co-occurring identifiers in those cases
        co_entities = (
            db.query(Entity)
            .join(CaseEntity, CaseEntity.entity_id == Entity.id)
            .filter(CaseEntity.case_id.in_(case_ids))
            .all()
        )
        
        identifiers = {
            "phones": {e.normalized_value for e in co_entities if e.type == "PHONE"},
            "vehicles": {e.normalized_value for e in co_entities if e.type == "VEHICLE"},
            "upis": {e.normalized_value for e in co_entities if e.type == "UPI"},
            "bank_accounts": {e.normalized_value for e in co_entities if e.type == "BANK_ACCOUNT"},
        }
        return identifiers

    def record_decision(self, db: Session, match_id: str, decision: str, reviewer_id: str = "investigator-01") -> Optional[EntityMatch]:
        match_obj = db.query(EntityMatch).filter(EntityMatch.id == match_id).first()
        if not match_obj:
            return None
            
        match_obj.status = decision.upper()
        match_obj.reviewed_by = reviewer_id
        db.commit()
        db.refresh(match_obj)
        
        log_audit(
            db=db,
            action=f"ENTITY_MATCH_{decision.upper()}",
            user_id=reviewer_id,
            entity_type="EntityMatch",
            entity_id=match_id,
            details={"decision": decision, "score": match_obj.score, "reasons": match_obj.match_reasons_json}
        )
        return match_obj

resolution_service = ResolutionService()
