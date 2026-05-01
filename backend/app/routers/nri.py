"""NRI Neighbor Router — Overseas Electors Assistance."""
from fastapi import APIRouter
from app.agents.nri_neighbor import nri_neighbor_agent

router = APIRouter()

@router.get("/guidance")
async def get_nri_guidance():
    """Provides specialized guidance for NRI voter registration."""
    return nri_neighbor_agent.get_registration_guidance()
