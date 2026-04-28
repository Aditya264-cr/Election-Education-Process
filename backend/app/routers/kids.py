"""Kids Mode Router — Adventure Guide Agent endpoints."""
from fastapi import APIRouter, Query
from app.agents.adventure_guide import transform_to_adventure, get_quest_message, transform_constituency_for_kids
from app.agents.map_maker import lookup_constituency

router = APIRouter()


@router.get("/transform")
async def adventure_transform(key: str = Query(..., description="Concept key to transform")):
    """Transform a civic concept into adventure language."""
    return transform_to_adventure(key)


@router.get("/quest")
async def get_quest(index: int = Query(0, description="Quest message index")):
    """Get a quest message for kids mode."""
    return {"quest": get_quest_message(index)}


@router.get("/kingdom")
async def get_kingdom(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
):
    """Get kingdom (constituency) data for kids mode."""
    constituency = lookup_constituency(lat, lng)
    if not constituency:
        return {"error": "Kingdom not found!"}

    return transform_constituency_for_kids(constituency.model_dump())
