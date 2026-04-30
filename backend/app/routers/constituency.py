"""Constituency Router — Map-Maker Agent endpoint."""
from fastapi import APIRouter, Query
from app.agents.map_maker import lookup_constituency, CONSTITUENCY_DATA
from app.agents.friendly_neighbor import transform_label

router = APIRouter()


@router.get("/lookup")
async def get_constituency(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    lang: str = Query("en", description="Language code: en, hi, mr"),
):
    """Look up constituency by coordinates — Map-Maker Agent in action."""
    result = lookup_constituency(lat, lng)
    if not result:
        return {
            "error": "No constituency found for this location",
            "fallback": "I want to be 100% sure I'm giving you the right info for your area. I'm double-checking the official records right now. In the meantime, here is the official ECI helpline (1950).",
            "mode": "trigger_search_by_epic",
            "eci_url": "https://voters.eci.gov.in",
        }

    return {
        "agent": "map_maker",
        "data": result.model_dump(),
        "labels": {
            "pc": transform_label("parliamentary_constituency", lang),
            "ac": transform_label("assembly_constituency", lang),
            "turnout": transform_label("voter_turnout", lang),
            "booth": transform_label("polling_station", lang),
            "mp": transform_label("member_of_parliament", lang),
        },
    }


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
