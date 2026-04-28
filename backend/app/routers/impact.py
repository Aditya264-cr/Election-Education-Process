"""Impact Router — voter turnout and impact stats."""
from fastapi import APIRouter, Query
from app.agents.map_maker import lookup_constituency

router = APIRouter()


@router.get("/stats")
async def get_impact_stats(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
):
    """Get voter impact statistics for a location."""
    constituency = lookup_constituency(lat, lng)
    if not constituency:
        return {"error": "No data available"}

    total = constituency.total_electors
    voted = constituency.total_voters
    didnt_vote = total - voted
    national_avg = 65.79

    return {
        "constituency": constituency.pc_name,
        "state": constituency.state,
        "total_electors": total,
        "total_voters": voted,
        "didnt_vote": didnt_vote,
        "turnout_2024": constituency.turnout_2024,
        "turnout_2019": constituency.turnout_2019,
        "national_average": national_avg,
        "your_vote_ratio": f"1 in {total:,}",
        "message": f"Your vote is 1 in {total:,} — that's more powerful than you think!",
    }
