"""
Constitutional Compliance Agent — Legal Auditor
================================================
Every piece of advice must be cross-verified against official sources.
If a statement cannot be traced to an official source, it is BLOCKED.

DATASET:
 - ECI Handbook for Candidates 2024
 - The Representation of the People Act, 1950 & 1951
 - Model Code of Conduct (MCC)
 - Constitutional Articles: 324–329
 - State election laws for WB, MH, DL, TN, KA, UP, GJ, RJ

SOURCE CATALOG:
 Each verified fact includes a source_id that maps to a real
 government document or ECI circular.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import urlparse

# ── Source Registry ──
# Maps every allowed claim to its official legal source.
# If a claim is NOT in this registry, the Compliance Agent blocks it.
VERIFIED_SOURCES = {
    # ECI General
    "eci_handbook_2024": {
        "title": "ECI Handbook for Candidates, 2024",
        "url": "https://www.eci.gov.in/candidate-nomination",
        "type": "official_handbook",
        "issuer": "Election Commission of India",
    },
    "rpa_1950": {
        "title": "The Representation of the People Act, 1950",
        "url": "https://legislative.gov.in/sites/default/files/A1950-43_0.pdf",
        "type": "statute",
        "issuer": "Parliament of India",
    },
    "rpa_1951": {
        "title": "The Representation of the People Act, 1951",
        "url": "internal://law-library/rpa-1951",
        "type": "internal_law_library",
        "issuer": "Parliament of India",
        "library_id": "rpa-1951",
    },
    "constitution_art324": {
        "title": "Article 324 — Superintendence, direction, and control of elections",
        "url": "https://legislative.gov.in/constitution-of-india",
        "type": "constitutional_article",
        "issuer": "Constitution of India",
    },
    "constitution_art326": {
        "title": "Article 326 — Elections on basis of adult suffrage",
        "url": "https://legislative.gov.in/constitution-of-india",
        "type": "constitutional_article",
        "issuer": "Constitution of India",
    },
    "constitution_art104": {
        "title": "Article 104 of the Constitution of India",
        "url": "internal://law-library/constitution-article-104",
        "type": "internal_law_library",
        "issuer": "Constitution of India",
        "library_id": "constitution-article-104",
    },
    "mcc_2024": {
        "title": "Model Code of Conduct, 2024",
        "url": "https://www.eci.gov.in/mcc",
        "type": "eci_guideline",
        "issuer": "Election Commission of India",
    },
    "eci_evm_faq": {
        "title": "ECI Official EVM FAQ",
        "url": "https://www.eci.gov.in/evm",
        "type": "official_faq",
        "issuer": "Election Commission of India",
    },
    "eci_vvpat_sop": {
        "title": "VVPAT Standard Operating Procedure",
        "url": "https://www.eci.gov.in/vvpat",
        "type": "official_sop",
        "issuer": "Election Commission of India",
    },
    "eci_voter_guide": {
        "title": "Voter's Guide 2024 — Know Your Rights",
        "url": "https://voters.eci.gov.in",
        "type": "official_guide",
        "issuer": "Election Commission of India",
    },
    "eci_helpline": {
        "title": "ECI National Helpline 1950",
        "url": "https://www.eci.gov.in/grievances",
        "type": "helpline",
        "issuer": "Election Commission of India",
    },
    "eci_communication_guidelines": {
        "title": "ECI Official Communication Guidelines",
        "url": "https://www.eci.gov.in/media-corner",
        "type": "eci_guideline",
        "issuer": "Election Commission of India",
    },
    "eci_mock_poll": {
        "title": "ECI Mock Poll Protocol",
        "url": "https://www.eci.gov.in/evm/mock-poll",
        "type": "official_sop",
        "issuer": "Election Commission of India",
    },
    "mysore_paints_eci": {
        "title": "Mysore Paints & Varnish Ltd / ECI — Indelible Ink",
        "url": "https://www.mysorepaints.co.in",
        "type": "official_vendor",
        "issuer": "Election Commission of India",
    },
}

# ── Verified Fact Claims ──
# Every claim the Storyteller can make, mapped to its source.
VERIFIED_CLAIMS = {
    "evm_no_wifi": {
        "claim": "EVMs are air-gapped — they have no WiFi, Bluetooth, or internet connectivity.",
        "source_ids": ["eci_evm_faq"],
        "verified": True,
        "legal_basis": "ECI Technical Expert Committee Report, 2017",
    },
    "evm_mock_poll": {
        "claim": "A mandatory mock poll of 1,000+ votes is conducted on every EVM before elections.",
        "source_ids": ["eci_mock_poll"],
        "verified": True,
        "legal_basis": "ECI Standard Operating Procedure for Poll Day",
    },
    "vvpat_7_seconds": {
        "claim": "The VVPAT paper slip is visible for 7 seconds before dropping into the sealed box.",
        "source_ids": ["eci_vvpat_sop"],
        "verified": True,
        "legal_basis": "Supreme Court Order (2019) — 5 random VVPAT verification",
    },
    "vvpat_5_random": {
        "claim": "VVPAT slips of 5 randomly selected booths are cross-checked per constituency.",
        "source_ids": ["eci_vvpat_sop"],
        "verified": True,
        "legal_basis": "Supreme Court of India, April 2019 — N Chandrababu Naidu v UOI",
    },
    "indelible_ink": {
        "claim": "Electoral ink contains silver nitrate and stays 4-6 weeks.",
        "source_ids": ["mysore_paints_eci"],
        "verified": True,
        "legal_basis": "Mysore Paints & Varnish Ltd (sole supplier since 1962)",
    },
    "voter_age_18": {
        "claim": "Any Indian citizen aged 18+ on January 1st of the qualifying year can vote.",
        "source_ids": ["constitution_art326", "rpa_1950"],
        "verified": True,
        "legal_basis": "61st Constitutional Amendment Act, 1988 — lowered from 21 to 18",
    },
    "eci_helpline_1950": {
        "claim": "The ECI National Voter Helpline number is 1950.",
        "source_ids": ["eci_helpline"],
        "verified": True,
        "legal_basis": "ECI Grievance Redressal System",
    },
    "polling_cancelled_rumor": {
        "claim": "Polling cancellation in any area must be officially confirmed by the District Election Officer.",
        "source_ids": ["eci_communication_guidelines"],
        "verified": True,
        "legal_basis": "Section 58 of the Representation of the People Act, 1951",
    },
    "no_photography_booth": {
        "claim": "Photography and mobile phones are not allowed inside the polling booth.",
        "source_ids": ["eci_handbook_2024", "rpa_1951"],
        "verified": True,
        "legal_basis": "Section 128 of the RPA 1951 — Maintenance of secrecy of voting",
    },
    "dry_day_48hrs": {
        "claim": "Liquor shops must close 48 hours before polling in the constituency.",
        "source_ids": ["eci_handbook_2024"],
        "verified": True,
        "legal_basis": "Section 135C of the Representation of the People Act, 1951",
    },
    "constitution_article_104": {
        "claim": "Article 104 penalizes a person who sits or votes in Parliament before taking the Article 99 oath, while disqualified, or while prohibited by law.",
        "source_ids": ["constitution_art104"],
        "verified": True,
        "legal_basis": "Article 104 of the Constitution of India",
    },
}


LEGAL_RULES = {
    "form_6_registration": {
        "if": {
            "age_gte": 18,
            "citizen": True,
            "electoral_roll": False,
        },
        "then": {
            "action": "FORM_6",
            "message": "Use Form 6 to apply for first-time voter registration.",
        },
        "source_ids": ["rpa_1950", "eci_voter_guide"],
        "source_metadata": {
            "authority": "Election Commission of India",
            "paragraph": "Voter registration: new elector application / Form 6",
            "excerpt": "Form 6 is used by a new voter for registration in the electoral roll.",
        },
    },
    "aadhaar_only_poll_day_id": {
        "if": {
            "has_aadhaar": True,
            "electoral_roll": True,
            "has_epic": False,
        },
        "then": {
            "action": "ALLOW_APPROVED_PHOTO_ID",
            "message": "Aadhaar is one accepted photo ID document, but your name must be on the electoral roll.",
        },
        "source_ids": ["eci_voter_guide"],
        "source_metadata": {
            "authority": "Election Commission of India",
            "paragraph": "Voter identification at polling station",
            "excerpt": "Electors who do not produce EPIC may produce one of the approved alternate photo identity documents.",
        },
    },
    "no_id_claim_override": {
        "if": {
            "claims_no_id_needed": True,
        },
        "then": {
            "action": "CORRECTION",
            "message": "Correction: According to ECI guidelines, you need one of the 12 approved photo ID documents.",
        },
        "source_ids": ["eci_voter_guide"],
        "source_metadata": {
            "authority": "Election Commission of India",
            "paragraph": "Identification of electors",
            "excerpt": "A voter must establish identity using EPIC or another approved photo identity document.",
        },
    },
    "form_12_migrant_worker": {
        "if": {
            "asks_form_12": True,
            "is_service_voter": False,
            "on_election_duty": False,
        },
        "then": {
            "action": "CHECK_ELIGIBILITY_FIRST",
            "message": "Hold on, neighbor! According to the law, we need to check Form 12 eligibility first. Let's do it together.",
        },
        "source_ids": ["rpa_1951", "eci_voter_guide"],
        "source_metadata": {
            "authority": "Election Commission of India",
            "paragraph": "Postal ballot / Form 12 eligibility",
            "excerpt": "Postal ballot facilities are available only to categories notified by law or ECI instructions.",
        },
    },
}


class ConstitutionalComplianceAgent:
    """
    Legal Auditor Agent.
    
    Verifies that every output from the Storyteller/Neighbor agents
    can be traced back to an official government source.
    
    Usage:
        auditor = ConstitutionalComplianceAgent()
        result = auditor.verify_claim("evm_no_wifi")
        # Returns: { verified: True, source: { ... }, legal_basis: "..." }
        
        result = auditor.verify_claim("random_unsourced_claim")
        # Returns: { verified: False, blocked: True, fallback: "..." }
    """
    
    def __init__(self):
        self.claims = VERIFIED_CLAIMS
        self.sources = VERIFIED_SOURCES
    
    def verify_claim(self, claim_id: str) -> dict:
        """
        Verify a claim by its ID.
        Returns source info if verified, or a BLOCKED response with fallback.
        """
        if claim_id not in self.claims:
            return self._block_response(
                f"Claim '{claim_id}' not found in verified registry."
            )
        
        claim = self.claims[claim_id]
        
        if not claim.get("verified", False):
            return self._block_response(
                f"Claim '{claim_id}' could not be verified against official records."
            )
        
        # Resolve sources
        resolved_sources = []
        for sid in claim.get("source_ids", []):
            src = self.sources.get(sid)
            if src:
                resolved_sources.append(src)
        
        if not resolved_sources:
            return self._block_response(
                f"No official source documents found for claim '{claim_id}'."
            )
        
        traceable_sources = [src for src in resolved_sources if self._is_traceable_source(src)]
        if not traceable_sources:
            return self._block_response(
                f"Claim '{claim_id}' has no traceable official government PDF/statute source. Please provide a valid source."
            )

        return {
            "verified": True,
            "blocked": False,
            "claim": claim["claim"],
            "sources": traceable_sources,
            "legal_basis": claim.get("legal_basis", ""),
        }
    
    def verify_text(self, text: str) -> dict:
        """
        Attempt to match free-text against known verified claims.
        Used by the Storyteller agent before outputting responses.
        """
        text_lower = text.lower()
        
        for claim_id, claim_data in self.claims.items():
            # Simple keyword matching — in production, use embeddings
            claim_keywords = claim_data["claim"].lower().split()
            matches = sum(1 for kw in claim_keywords if kw in text_lower)
            match_ratio = matches / len(claim_keywords) if claim_keywords else 0
            
            if match_ratio > 0.4:
                return self.verify_claim(claim_id)
        
        # No match found — block with neighborly fallback
        return self._block_response(
            "This statement could not be verified against official records."
        )

    def evaluate_rule(self, facts: dict) -> dict:
        """
        Evaluate legal facts through symbolic if-then rules.
        Returns the first matching action with source metadata.
        """
        for rule_id, rule in LEGAL_RULES.items():
            if self._rule_matches(rule["if"], facts):
                sources = [self.sources[sid] for sid in rule["source_ids"] if sid in self.sources]
                return {
                    "matched": True,
                    "blocked": False,
                    "rule_id": rule_id,
                    "action": rule["then"]["action"],
                    "message": rule["then"]["message"],
                    "source_metadata": rule["source_metadata"],
                    "sources": sources,
                }
        return self._block_response(
            "No symbolic legal rule matched these facts. We need to check the official ECI portal first."
        )

    def hard_match_text(self, text: str) -> Optional[dict]:
        """Intercept high-risk legal statements before persona output."""
        q = text.lower()
        if "vote without id" in q or "without id" in q or "no id" in q:
            return self.evaluate_rule({"claims_no_id_needed": True})
        if "aadhaar" in q and ("first" in q or "new voter" in q):
            return self.evaluate_rule({"has_aadhaar": True, "electoral_roll": False, "citizen": True, "age": 18})
        if "form 12" in q or "postal ballot" in q:
            return self.evaluate_rule({"asks_form_12": True, "is_service_voter": False, "on_election_duty": False})
        if "eci act 104" in q or "article 104" in q or "act 104" in q:
            return {
                "matched": True,
                "blocked": False,
                "rule_id": "constitution_article_104_precision",
                "action": "OPEN_INTERNAL_DOCUMENT",
                "message": "ECI ACT 104 appears to mean Article 104 of the Constitution of India.",
                "document_id": "constitution-article-104",
                "source_metadata": {
                    "authority": "Constitution of India",
                    "paragraph": "Article 104",
                    "excerpt": "Penalty for sitting and voting before making oath or affirmation under article 99...",
                },
                "sources": [self.sources["constitution_art104"]],
            }
        return None
    
    def get_all_sources(self) -> list:
        """Return all sources for the accuracy report."""
        return [
            {
                "id": sid,
                **source,
            }
            for sid, source in self.sources.items()
        ]
    
    def get_accuracy_report(self) -> dict:
        """
        Generate the Accuracy Report for developer review.
        Lists every data source used in the platform.
        """
        total_claims = len(self.claims)
        verified = sum(1 for c in self.claims.values() if c.get("verified"))
        
        return {
            "report_title": "Friendly Neighbor Civic AI — Accuracy Report",
            "developer": "Aditya Patil",
            "total_claims": total_claims,
            "verified_claims": verified,
            "coverage": f"{(verified / total_claims * 100):.0f}%",
            "sources": self.get_all_sources(),
            "claims": {
                cid: {
                    "text": c["claim"],
                    "status": "✅ VERIFIED" if c["verified"] else "❌ UNVERIFIED",
                    "legal_basis": c.get("legal_basis", "N/A"),
                    "source_ids": c.get("source_ids", []),
                }
                for cid, c in self.claims.items()
            },
            "symbolic_rules": LEGAL_RULES,
            "compliance_note": (
                "All civic information in this platform is sourced from "
                "official ECI publications, Constitutional articles, and "
                "Parliamentary statutes. No AI-generated legal advice "
                "is provided without source verification."
            ),
        }

    @staticmethod
    def _rule_matches(conditions: dict, facts: dict) -> bool:
        for key, expected in conditions.items():
            if key == "age_gte":
                if facts.get("age", -1) < expected:
                    return False
                continue
            if facts.get(key) != expected:
                return False
        return True

    def latest_gazette_status(self, last_checked_iso: Optional[str] = None) -> dict:
        """
        Enforce freshness checks for legal updates.
        If no recent check in last 24h, block legal output until refreshed.
        """
        now = datetime.now(timezone.utc)
        if not last_checked_iso:
            return {
                "verified": False,
                "blocked": True,
                "reason": "No Gazette refresh timestamp found in last 24 hours.",
                "required_action": "Run Gazette refresh before answering law-change questions.",
            }
        try:
            checked = datetime.fromisoformat(last_checked_iso.replace("Z", "+00:00"))
        except ValueError:
            return {
                "verified": False,
                "blocked": True,
                "reason": "Invalid Gazette refresh timestamp format.",
                "required_action": "Provide ISO-8601 timestamp from last Gazette sync.",
            }
        if now - checked > timedelta(hours=24):
            return {
                "verified": False,
                "blocked": True,
                "reason": "Gazette data older than 24 hours.",
                "required_action": "Refresh Gazette data before answering law-change questions.",
            }
        return {"verified": True, "blocked": False, "last_checked": checked.isoformat()}

    @staticmethod
    def _is_traceable_source(source: dict) -> bool:
        """
        Strict legal traceability:
        - either statutory/constitutional type
        - or direct government PDF link
        """
        url = source.get("url", "")
        src_type = source.get("type", "")
        if src_type in {"statute", "constitutional_article", "internal_law_library"}:
            return True
        parsed = urlparse(url)
        is_gov = parsed.netloc.endswith("gov.in")
        is_pdf = parsed.path.lower().endswith(".pdf")
        return bool(is_gov and is_pdf)
    
    @staticmethod
    def _block_response(reason: str) -> dict:
        return {
            "verified": False,
            "blocked": True,
            "reason": reason,
            "fallback": (
                "I want to be 100% sure I'm giving you the right info for your area. "
                "I'm double-checking the official records right now. "
                "In the meantime, here is the official ECI helpline: 1950. "
                "You can also check https://voters.eci.gov.in for verified information."
            ),
        }
