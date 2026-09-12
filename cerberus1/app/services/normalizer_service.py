import re
from typing import Tuple

class NormalizerService:
    @staticmethod
    def normalize_phone(raw: str) -> str:
        """Strip country code (+91), spaces, dashes and return 10 digits."""
        cleaned = re.sub(r"[^\d]", "", raw)
        if cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = cleaned[2:]
        elif cleaned.startswith("0") and len(cleaned) == 11:
            cleaned = cleaned[1:]
        return cleaned

    @staticmethod
    def normalize_vehicle(raw: str) -> str:
        """Normalize Indian registration (e.g. 'KL 07 AB 1234' -> 'KL07AB1234')."""
        return re.sub(r"[^A-Za-z0-9]", "", raw).upper()

    @staticmethod
    def normalize_upi(raw: str) -> str:
        """Lowercase and trim UPI address."""
        return raw.strip().lower()

    @staticmethod
    def normalize_email(raw: str) -> str:
        """Lowercase and trim email."""
        return raw.strip().lower()

    @staticmethod
    def normalize_bank_account(raw: str) -> Tuple[str, str]:
        """Returns (normalized_digits, masked_identifier)."""
        digits = re.sub(r"[^\d]", "", raw)
        masked = f"XXXX-XXXX-{digits[-4:]}" if len(digits) >= 4 else f"XXXX-{digits}"
        return digits, masked

    @staticmethod
    def normalize_person_name(raw: str) -> str:
        """Strip honorifics, extra whitespace, standard title casing."""
        cleaned = re.sub(r"^(Mr\.|Mrs\.|Ms\.|Dr\.|Shri|Smt\.|Adv\.)\s*", "", raw.strip(), flags=re.IGNORECASE)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned.title()

    @staticmethod
    def normalize_organization(raw: str) -> str:
        cleaned = re.sub(r"\s+", " ", raw.strip())
        return cleaned.title()

    @staticmethod
    def normalize_location(raw: str) -> str:
        cleaned = re.sub(r"\s+", " ", raw.strip())
        return cleaned.title()

normalizer_service = NormalizerService()
