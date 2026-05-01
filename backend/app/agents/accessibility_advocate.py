"""
THE ACCESSIBILITY ADVOCATE AGENT
================================
Role: Dignity Navigator — processes Assured Minimum Facilities (AMF) data
to ensure every neighbor, regardless of mobility or vision, can vote with dignity.
"""
from typing import Dict, Any, List
import random

class AccessibilityAdvocateAgent:
    """
    Agent for processing booth-level accessibility metadata.
    """
    def __init__(self):
        # Assured Minimum Facilities (AMF) mapping by LGD code prefix or constituency
        self.amf_registry = {
            "Nashik": {
                "dignity_score": 95,
                "facilities": ["Wheelchair Ramp", "Braille Ballot Paper", "Senior Citizen Fast-track", "Drinking Water"],
                "directions": "Ramp available on the left side of the main entrance."
            },
            "Kolkata North": {
                "dignity_score": 88,
                "facilities": ["Wheelchair Ramp", "Help Desk", "Priority Queue for PwD"],
                "directions": "Enter via Gate 2 for step-free access."
            },
            "Pune": {
                "dignity_score": 92,
                "facilities": ["Wheelchair Ramp", "Waiting Room", "Sign Language Interpreter"],
                "directions": "Priority fast-track is active at Booth 15."
            }
        }
        self.default_amf = {
            "dignity_score": 85,
            "facilities": ["Basic Ramp", "Priority for Seniors"],
            "directions": "Please ask the volunteer at the entrance for priority assistance."
        }

    def get_booth_accessibility(self, pc_name: str) -> Dict[str, Any]:
        """Returns AMF metadata for a specific constituency."""
        data = self.amf_registry.get(pc_name, self.default_amf)
        return {
            "agent": "accessibility_advocate",
            "pc_name": pc_name,
            "dignity_score": data["dignity_score"],
            "features": data["facilities"],
            "voice_prompt": f"Neighbor, this booth in {pc_name} has a {data['facilities'][0]}. {data['directions']}",
            "last_verified": "2026-05-01"
        }

accessibility_advocate_agent = AccessibilityAdvocateAgent()
