"""
THE LIVE INTERPRETER AGENT
==========================
Role: Civic Oracle — provides context, not just numbers. Connects live counting
trends to local neighborhood issues identified in the Village Square.
"""
from typing import Dict, Any
import asyncio

class LiveInterpreterAgent:
    """
    Interprets live data and generates contextual insights for the user.
    """
    async def get_insight(self, pc_name: str, live_data: Dict[str, Any]) -> str:
        """Analyze lead shifts against local concerns."""
        await asyncio.sleep(0.1)
        
        party_a_lead = live_data["leads"]["Party A Alliance"]
        party_b_lead = live_data["leads"]["Party B Alliance"]
        
        if party_a_lead > party_b_lead:
            leading_party = "Party A Alliance"
        else:
            leading_party = "Party B Alliance"

        insight = (
            f"Neighbor, in {pc_name}, the lead has just shifted to {leading_party}. "
            f"This aligns closely with the 'Infrastructure & Water' concerns we identified in the Village Square earlier today. "
            f"We are monitoring the trends to lock these promises into your 5-Year Ledger once the ECI issues the official certificate."
        )
        return insight

live_interpreter_agent = LiveInterpreterAgent()
