import asyncio
from fastapi import APIRouter, Query, HTTPException
from app.agents.map_maker import map_maker_agent
from app.agents.researcher import researcher_agent
from app.agents.constitutional_compliance import ConstitutionalComplianceAgent
from app.agents.friendly_neighbor import transform_label
from app.agents.accessibility_advocate import accessibility_advocate_agent

router = APIRouter()
compliance_agent = ConstitutionalComplianceAgent()

@router.get("/lookup")
async def get_constituency(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    lang: str = Query("en", description="Language code: en, hi, mr"),
):
    """
    Look up constituency by coordinates — Proactive Civic Intelligence Engine.
    Orchestrates multiple agents in parallel for a comprehensive snapshot.
    """
    # 1. Resolve geographic identity first
    base_data = await map_maker_agent["lookup"](lat, lng)
    if not base_data:
        raise HTTPException(status_code=404, detail={
            "error": "No constituency found for this location",
            "fallback": "I want to be 100% sure I'm giving you the right info for your area. I'm double-checking official records.",
            "mode": "trigger_search_by_epic"
        })

    pc_name = base_data.pc_name

    # 2. Parallel Agent Execution: Fetch secondary intelligence
    metrics_task = map_maker_agent["metrics"](pc_name)
    issues_task = researcher_agent.get_local_issues(pc_name)
    roi_task = researcher_agent.get_infrastructure_roi(pc_name)
    accessibility_task = asyncio.to_thread(accessibility_advocate_agent.get_booth_accessibility, pc_name)
    
    metrics, local_issues, roi, accessibility = await asyncio.gather(
        metrics_task,
        issues_task,
        roi_task,
        accessibility_task
    )

    return {
        "agent": "civic_intelligence_engine",
        "identity": base_data.model_dump(),
        "intelligence": {
            "booth_health": metrics,
            "local_issues": local_issues,
            "vote_roi": roi,
            "accessibility": accessibility,
            "labels": {
                "pc": transform_label("parliamentary_constituency", lang),
                "ac": transform_label("assembly_constituency", lang),
                "turnout": transform_label("voter_turnout", lang),
                "booth": transform_label("polling_station", lang),
                "mp": transform_label("member_of_parliament", lang),
            }
        }
    }

@router.get("/{pc_name}/accessibility")
async def get_accessibility(pc_name: str):
    """Specific endpoint for AMF accessibility details."""
    return accessibility_advocate_agent.get_booth_accessibility(pc_name)

@router.get("/search-by-pincode")
async def search_by_pincode(pincode: str = Query(..., pattern=r"^\d{6}$")):
    """Graceful degradation endpoint when map/GPS is uncertain."""
    return {
        "error": "Pincode is not an authoritative booth lookup key.",
        "mode": "trigger_search_by_epic",
        "message": "Please use the official Electoral Search portal for exact EPIC-linked booth data.",
        "helpline": "1950",
        "eci_url": "https://voters.eci.gov.in",
    }
