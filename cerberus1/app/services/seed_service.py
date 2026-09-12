import os
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.sql_models import (
    Station, Case, Document, DocumentChunk, Extraction,
    Entity, CaseEntity, EntityMatch, Event, Evidence, AuditLog
)
from app.services.storage_service import storage_service
from app.services.resolution_service import resolution_service
from app.services.graph_service import graph_service
from app.schemas.extraction import AIExtractionContract

SAMPLE_FIR_TEXT_1 = """
FIRST INFORMATION REPORT (FIR No: 001/2026)
Police Station: Cyber Crime Police Station Kochi
Date & Time of Occurrence: 15-02-2026 11:30 hrs
Complainant: Priya Sharma, residing at Marine Drive, Kochi.

Details of Incident:
The complainant reported being cheated of Rs. 2,50,000 via a fraudulent investment scheme operated on Telegram.
Accused: Rahul Kumar, operating under alias RK Trader.
Contact Number: 9876543210
Vehicle Observed: White Hyundai Creta, Registration No: KL-07-AB-1234
Organization: ABC Trading Pvt Ltd
Bank Account: 123456789012 (IFSC: SBIN0001234, State Bank of India)
UPI ID: rahul@oksbi
Location of Operation: Panampilly Nagar, Kochi, Kerala.

Investigation officer notes: Suspect communicated through phone 9876543210 requesting emergency RTGS and UPI payments.
"""

SAMPLE_FIR_TEXT_2 = """
FIRST INFORMATION REPORT (FIR No: 002/2026)
Police Station: Cyber Crime Police Station Kochi
Date & Time of Occurrence: 22-02-2026 16:45 hrs
Complainant: Anand Menon, residing at Kadavanthra, Ernakulam.

Details of Incident:
Instant loan app extortion scam. Complainant harassed with abusive calls and morphing threats after downloading FastLoan app.
Accused Person: R. Kumar
Associated Mobile: 9876543210
Email: rahul.k@example.com
UPI Identifier: rahul@oksbi
Location: Ernakulam, Kerala.

Investigation officer notes: The calls originated from SIM card registered to phone number 9876543210.
"""

SAMPLE_FIR_TEXT_3 = """

FIRST INFORMATION REPORT (FIR No: 284/2024)
Police Station: Cyber Crime Police Station Cyberabad
Date & Time of FIR: 12-04-2024 10:15 hrs
Complainant: Dr. K. Ramanathan, residing at Jubilee Hills, Hyderabad.

Details of Incident:
eSIM swap and netbanking fund siphoning totaling Rs. 48,50,000.
Accused: Vikram Sharma @ Vicky, operating tele-calling unit.
Contact Number: 9876543210
Mule Provider: Ramesh Yadav
Bank Account: 5010049281726 (HDFC Bank)
Associated Vehicle: DL-03C-AS-4921
Location: Jamtara (BTS Tower JMT-042)
Organization: Star Pay Fintech Solutions
"""

def seed_synthetic_data(db: Session):
    """Seed synthetic cases, documents, extraction review, and cross-case links for Section 10 verification."""
    # 1. Station
    station = db.query(Station).filter(Station.code == "STN-KOC-01").first()
    if not station:
        station = Station(
            code="STN-KOC-01",
            name="Cyber Crime Police Station Kochi",
            district="Ernakulam",
            state="Kerala"
        )
        db.add(station)
        db.flush()

    # 2. Case 1
    case1 = db.query(Case).filter(Case.fir_number == "001/2026/CYBER").first()
    if not case1:
        case1 = Case(
            fir_number="001/2026/CYBER",
            title="Telegram Investment Fraud Scheme",
            description="Defrauding victims through fake cryptocurrency investment promises",
            category="FINANCIAL_CRIME",
            station_id=station.id,
            status="UNDER_INVESTIGATION"
        )
        db.add(case1)
        db.flush()

        # Document 1
        stored_file1 = storage_service.save_bytes(
            SAMPLE_FIR_TEXT_1.encode("utf-8"),
            "FIR_001_Investment_Fraud.txt",
            mime_type="text/plain"
        )
        doc1 = Document(
            case_id=case1.id,
            filename=stored_file1["filename"],
            file_path=stored_file1["file_path"],
            file_hash=stored_file1["file_hash"],
            mime_type=stored_file1["mime_type"],
            file_size=stored_file1["file_size"],
            status="EXTRACTED"
        )
        db.add(doc1)
        db.flush()

        chunk1 = DocumentChunk(
            document_id=doc1.id,
            page_number=1,
            chunk_index=0,
            text_content=SAMPLE_FIR_TEXT_1.strip()
        )
        db.add(chunk1)
        db.flush()

        # Contract 1
        c1_payload = {
            "case": {"crime_category": "FINANCIAL_CRIME", "fir_number": case1.fir_number, "title": case1.title},
            "persons": [{"name": "Rahul Kumar", "role": "ACCUSED", "aliases": ["RK Trader"]}],
            "phones": [{"value": "9876543210"}],
            "vehicles": [{"registration": "KL07AB1234"}],
            "locations": [{"name": "Kochi"}],
            "organizations": [{"name": "ABC Trading"}],
            "bank_accounts": [{"account_number": "123456789012", "ifsc": "SBIN0001234"}],
            "upis": [{"value": "rahul@oksbi"}],
            "emails": [],
            "events": [
                {
                    "event_type": "FRAUD_CALL",
                    "description": "Suspect communicated demanding emergency payment",
                    "occurred_at": "2026-02-15T11:30:00"
                }
            ],
            "relationships": [
                {"source_type": "Person", "source_name": "Rahul Kumar", "relationship": "OWNS_PHONE", "target_type": "Phone", "target_value": "9876543210"},
                {"source_type": "Person", "source_name": "Rahul Kumar", "relationship": "OPERATES_VEHICLE", "target_type": "Vehicle", "target_value": "KL07AB1234"},
                {"source_type": "Person", "source_name": "Rahul Kumar", "relationship": "USES_UPI", "target_type": "UPI", "target_value": "rahul@oksbi"}
            ]
        }
        contract1 = AIExtractionContract.model_validate(c1_payload)
        ext1 = Extraction(
            document_id=doc1.id,
            raw_json=c1_payload,
            validated_json=contract1.model_dump(),
            status="APPROVED"
        )
        db.add(ext1)
        db.flush()

        # Process and persist approved entities
        resolution_service.process_and_persist_approved_extraction(db, case1.id, ext1.id, contract1)

        # Event
        ev1 = Event(
            case_id=case1.id,
            event_type="FRAUD_CALL",
            description="Telegram investment fraud solicitation call",
            occurred_at=datetime.fromisoformat("2026-02-15T11:30:00")
        )
        db.add(ev1)

        # Evidence
        evi1 = Evidence(
            case_id=case1.id,
            document_id=doc1.id,
            chunk_id=chunk1.id,
            provenance_text="Accused: Rahul Kumar, Contact Number: 9876543210, Vehicle: KL-07-AB-1234",
            confidence=1.0
        )
        db.add(evi1)

    # 3. Case 2 (Second case sharing Phone 9876543210 and Accused R. Kumar)
    case2 = db.query(Case).filter(Case.fir_number == "002/2026/CYBER").first()
    if not case2:
        case2 = Case(
            fir_number="002/2026/CYBER",
            title="Extortion Via Unregistered Instant Loan App",
            description="Victim threatened with morphed photos and extortion via WhatsApp calls",
            category="FINANCIAL_CRIME",
            station_id=station.id,
            status="UNDER_INVESTIGATION"
        )
        db.add(case2)
        db.flush()

        stored_file2 = storage_service.save_bytes(
            SAMPLE_FIR_TEXT_2.encode("utf-8"),
            "FIR_002_Loan_App_Extortion.txt",
            mime_type="text/plain"
        )
        doc2 = Document(
            case_id=case2.id,
            filename=stored_file2["filename"],
            file_path=stored_file2["file_path"],
            file_hash=stored_file2["file_hash"],
            mime_type=stored_file2["mime_type"],
            file_size=stored_file2["file_size"],
            status="EXTRACTED"
        )
        db.add(doc2)
        db.flush()

        chunk2 = DocumentChunk(
            document_id=doc2.id,
            page_number=1,
            chunk_index=0,
            text_content=SAMPLE_FIR_TEXT_2.strip()
        )
        db.add(chunk2)
        db.flush()

        c2_payload = {
            "case": {"crime_category": "FINANCIAL_CRIME", "fir_number": case2.fir_number, "title": case2.title},
            "persons": [{"name": "R. Kumar", "role": "ACCUSED"}],
            "phones": [{"value": "9876543210"}],
            "vehicles": [],
            "locations": [{"name": "Ernakulam"}],
            "organizations": [],
            "bank_accounts": [],
            "upis": [{"value": "rahul@oksbi"}],
            "emails": [{"value": "rahul.k@example.com"}],
            "events": [
                {
                    "event_type": "EXTORTION_CALL",
                    "description": "WhatsApp harassment call demanding immediate repayment",
                    "occurred_at": "2026-02-22T16:45:00"
                }
            ],
            "relationships": [
                {"source_type": "Person", "source_name": "R. Kumar", "relationship": "OWNS_PHONE", "target_type": "Phone", "target_value": "9876543210"},
                {"source_type": "Person", "source_name": "R. Kumar", "relationship": "USES_UPI", "target_type": "UPI", "target_value": "rahul@oksbi"}
            ]
        }
        contract2 = AIExtractionContract.model_validate(c2_payload)
        ext2 = Extraction(
            document_id=doc2.id,
            raw_json=c2_payload,
            validated_json=contract2.model_dump(),
            status="APPROVED"
        )
        db.add(ext2)
        db.flush()

        resolution_service.process_and_persist_approved_extraction(db, case2.id, ext2.id, contract2)

        ev2 = Event(
            case_id=case2.id,
            event_type="EXTORTION_CALL",
            description="WhatsApp extortion communication",
            occurred_at=datetime.fromisoformat("2026-02-22T16:45:00")
        )
        db.add(ev2)

        evi2 = Evidence(
            case_id=case2.id,
            document_id=doc2.id,
            chunk_id=chunk2.id,
            provenance_text="Accused Person: R. Kumar, Associated Mobile: 9876543210, Email: rahul.k@example.com",
            confidence=1.0
        )
        db.add(evi2)

    # 4. Case 3 (FIR No. 284/2024 eSIM Swap Syndicate)
    case3 = db.query(Case).filter((Case.fir_number == "284/2024/CYBER") | (Case.id == "FIR-284-2024")).first()
    if not case3:
        station2 = db.query(Station).filter(Station.code == "STN-CYB-01").first()
        if not station2:
            station2 = Station(
                code="STN-CYB-01",
                name="Cyber Crime Police Station Cyberabad",
                district="Cyberabad",
                state="Telangana"
            )
            db.add(station2)
            db.flush()

        case3 = Case(
            id="FIR-284-2024",
            fir_number="284/2024/CYBER",
            title="eSIM Swap & NetBanking Siphoning Syndicate",
            description="Phishing tele-caller duped victim into authorizing eSIM swap, siphoning Rs. 48.5L into mule accounts",
            category="FINANCIAL_CRIME",
            station_id=station2.id,
            status="UNDER_INVESTIGATION"
        )
        db.add(case3)
        db.flush()

        stored_file3 = storage_service.save_bytes(
            SAMPLE_FIR_TEXT_3.encode("utf-8"),
            "FIR_284_2024_Cyberabad_Complaint.pdf",
            mime_type="application/pdf"
        )
        doc3 = Document(
            case_id=case3.id,
            filename=stored_file3["filename"],
            file_path=stored_file3["file_path"],
            file_hash=stored_file3["file_hash"],
            mime_type=stored_file3["mime_type"],
            file_size=stored_file3["file_size"],
            status="EXTRACTED"
        )
        db.add(doc3)
        db.flush()

        chunk3 = DocumentChunk(
            document_id=doc3.id,
            page_number=1,
            chunk_index=0,
            text_content=SAMPLE_FIR_TEXT_3.strip()
        )
        db.add(chunk3)
        db.flush()

        c3_payload = {
            "case": {"crime_category": "FINANCIAL_CRIME", "fir_number": case3.fir_number, "title": case3.title},
            "persons": [
                {"name": "Vikram Sharma", "role": "ACCUSED", "aliases": ["Vicky"]},
                {"name": "Ramesh Yadav", "role": "MULE"},
                {"name": "Dr. K. Ramanathan", "role": "VICTIM"}
            ],
            "phones": [{"value": "9876543210"}],
            "vehicles": [{"registration": "DL03CAS4921", "make_model": "White Swift"}],
            "locations": [{"name": "Jamtara", "coordinates": "24.1678 N, 86.8421 E"}],
            "organizations": [{"name": "Star Pay Fintech Solutions"}],
            "bank_accounts": [{"account_number": "5010049281726", "bank_name": "HDFC Bank", "holder_name": "Ramesh Yadav"}],
            "upis": [{"value": "vicky@upi"}],
            "emails": [],
            "events": [
                {
                    "event_type": "FRAUD_CALL",
                    "description": "Phishing incoming call from 9876543210 inducing eSIM authorization",
                    "occurred_at": "2024-04-09T11:20:00"
                },
                {
                    "event_type": "MONEY_TRANSFER",
                    "description": "IMPS fund transfer totaling Rs. 18,00,000 into HDFC mule account",
                    "occurred_at": "2024-04-09T12:05:00"
                }
            ],
            "relationships": [
                {"source_type": "Person", "source_name": "Vikram Sharma", "relationship": "OWNS_PHONE", "target_type": "Phone", "target_value": "9876543210"},
                {"source_type": "Person", "source_name": "Ramesh Yadav", "relationship": "HOLDS_ACCOUNT", "target_type": "BankAccount", "target_value": "5010049281726"}
            ]
        }
        contract3 = AIExtractionContract.model_validate(c3_payload)
        ext3 = Extraction(
            document_id=doc3.id,
            raw_json=c3_payload,
            validated_json=contract3.model_dump(),
            status="APPROVED"
        )
        db.add(ext3)
        db.flush()

        resolution_service.process_and_persist_approved_extraction(db, case3.id, ext3.id, contract3)

        ev3 = Event(
            case_id=case3.id,
            event_type="FRAUD_CALL",
            description="Phishing telecom contact duping complainant into eSIM transfer",
            occurred_at=datetime.fromisoformat("2024-04-09T11:20:00")
        )
        db.add(ev3)

        evi3 = Evidence(
            id="ev-001",
            case_id=case3.id,
            document_id=doc3.id,
            chunk_id=chunk3.id,
            provenance_text="Complainant Dr. K. Ramanathan states that fund siphoning totaling Rs. 48.5L occurred following eSIM deactivation. Accused: Vikram Sharma, Contact: 9876543210.",
            confidence=1.0
        )
        db.add(evi3)

    db.commit()

    try:
        if case1:
            graph_service.sync_case_to_graph(db, case1.id)
        if case2:
            graph_service.sync_case_to_graph(db, case2.id)
        if case3:
            graph_service.sync_case_to_graph(db, case3.id)
    except Exception as e:
        print(f"Neo4j sync during seed: {e}")


    # Audit log
    audit_entry = AuditLog(
        user_id="system-init",
        action="SEED_SYNTHETIC_DATA",
        entity_type="Case",
        details_json={"cases_seeded": ["001/2026/CYBER", "002/2026/CYBER"]}
    )
    db.add(audit_entry)
    db.commit()
    print("Seed synthetic data completed successfully.")
