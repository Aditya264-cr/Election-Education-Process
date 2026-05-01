"""
THE RESEARCHER AGENT
====================
Role: Contextual Intelligence — fetches hyper-local issues, infrastructure projects,
and direct ROI data for a constituency.
"""
import asyncio
import random
from typing import List, Dict

LOCAL_ISSUES_DB = {
    "Mumbai North": [
        {"title": "Coastal Road Extension", "status": "Active", "impact": "Reduces commute by 40 mins"},
        {"title": "Metro Line 2A Integration", "status": "Completed", "impact": "3 Lakh+ daily commuters"}
    ],
    "Pune": [
        {"title": "Pune Metro Phase 1", "status": "Active", "impact": "Direct connection to IT hubs"},
        {"title": "River Rejuvenation Project", "status": "Planned", "impact": "Improves water quality for 50 Lakh people"}
    ],
    "New Delhi": [
        {"title": "Central Vista Redevelopment", "status": "Active", "impact": "Modern governance infrastructure"},
        {"title": "Electric Bus Rollout", "status": "Completed", "impact": "Zero emission transit for 10 Lakh daily users"}
    ]
}

DEFAULT_ISSUES = [
    {"title": "Digital Literacy Initiative", "status": "Ongoing", "impact": "Local youth upskilling"},
    {"title": "Community Health Center Upgrade", "status": "Active", "impact": "Better primary care access"}
]

class ResearcherAgent:
    """
    Agent for scraping and providing hyper-local civic data.
    """
    async def get_local_issues(self, pc_name: str) -> List[Dict]:
        """Mock scraping/fetching local issues for a constituency."""
        # Simulate network latency
        await asyncio.sleep(random.uniform(0.1, 0.3))
        return LOCAL_ISSUES_DB.get(pc_name, DEFAULT_ISSUES)

    async def get_infrastructure_roi(self, pc_name: str) -> str:
        """Calculate the direct ROI of a vote based on previous cycle funding."""
        await asyncio.sleep(random.uniform(0.05, 0.15))
        funding = random.randint(500, 2000) # Crores
        return f"In the last cycle, ₹{funding} Cr was invested in {pc_name} for community projects."

researcher_agent = ResearcherAgent()
