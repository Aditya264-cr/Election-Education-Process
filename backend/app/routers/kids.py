"""Kids Mode Router — Adventure Guide Agent endpoints."""
from fastapi import APIRouter, Query
from app.agents.adventure_guide import adventure_guide_agent
from app.agents.map_maker import map_maker_agent

router = APIRouter()


@router.get("/transform")
async def adventure_transform(key: str = Query(..., description="Concept key to transform")):
    """Transform a civic concept into adventure language."""
    return adventure_guide_agent.transform_concept(key)


@router.get("/debate")
async def start_debate(topic: str = Query("snacks", description="Debate topic ID")):
    """Starts a friendly civic debate."""
    return adventure_guide_agent.start_debate(topic)


@router.get("/kingdom")
async def get_kingdom(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
):
    """Get kingdom (constituency) data for kids mode."""
    constituency = await map_maker_agent["lookup"](lat, lng)
    if not constituency:
        return {"error": "Kingdom not found!"}

    # Use a simpler transform for now or just return the data
    return {
        "kingdom_name": f"The {constituency.pc_name} Kingdom",
        "castle_name": "The Great Beep Castle 🏰",
        "castle_location": constituency.booth,
        "champion": constituency.mp,
    }
