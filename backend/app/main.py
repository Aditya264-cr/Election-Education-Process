"""
Friendly Neighbor Civic AI — FastAPI Backend
=============================================
Multi-agent backend for constituency lookup, content transformation,
and kids mode logic.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import constituency, timeline, impact, kids, compliance

app = FastAPI(
    title="Friendly Neighbor Civic AI",
    description="Multi-agent backend for civic education",
    version="1.0.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "agents": {
            "map_maker": "active",
            "friendly_neighbor": "active",
            "adventure_guide": "active",
            "fact_checker": "standby",
            "constitutional_compliance": "active",
        },
        "message": "Welcome to the neighborhood! Everything is running smoothly."
    }

app.include_router(constituency.router, prefix="/api/constituency", tags=["Map-Maker"])
app.include_router(timeline.router, prefix="/api/timeline", tags=["Timeline"])
app.include_router(impact.router, prefix="/api/impact", tags=["Impact"])
app.include_router(kids.router, prefix="/api/kids", tags=["Adventure Guide"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Constitutional Compliance"])
