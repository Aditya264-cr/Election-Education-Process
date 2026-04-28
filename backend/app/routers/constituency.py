"""Constituency Router — Map-Maker Agent endpoint."""
from fastapi import APIRouter, Query
from app.agents.map_maker import lookup_constituency
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
        return {"error": "No constituency found for this location"}

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
