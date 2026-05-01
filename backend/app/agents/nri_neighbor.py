"""
THE NRI NEIGHBOR AGENT
======================
Role: Overseas Voter Assistance — specialized guidance for Non-Resident Indians
registering via Form 6A and understanding proxy/postal limitations.
"""
from typing import Dict, Any

class NRINeighborAgent:
    """
    Assists Overseas Electors (NRIs) with registration and voting procedures.
    """
    def __init__(self):
        self.forms_info = {
            "registration": {
                "form": "Form 6A",
                "purpose": "Application for inclusion of name in electoral roll by an overseas Indian elector.",
                "requirements": [
                    "Valid Indian Passport",
                    "Visa of the foreign country",
                    "Passport size photograph"
                ],
                "process": "Can be filed online via NVSP portal or downloaded and sent to the Electoral Registration Officer (ERO) of your home constituency."
            }
        }
        
    def get_registration_guidance(self) -> Dict[str, Any]:
        """Provides guidance for NRI voter registration."""
        return {
            "agent": "nri_neighbor",
            "status": "active",
            "message": "Hello neighbor from afar! As an NRI, you can vote in your home constituency. You need to register using Form 6A.",
            "details": self.forms_info["registration"],
            "voting_method": "Currently, NRIs must cast their vote in person at their designated polling booth in India. E-postal ballots (ETPBS) for NRIs are under consideration but not yet implemented for all."
        }

nri_neighbor_agent = NRINeighborAgent()
