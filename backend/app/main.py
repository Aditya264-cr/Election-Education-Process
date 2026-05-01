"""
Friendly Neighbor Civic AI — FastAPI Backend
=============================================
Multi-agent backend for constituency lookup, content transformation,
and kids mode logic.
"""
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.routers import constituency, timeline, impact, kids, compliance, law_library, nri

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="Friendly Neighbor Civic AI",
    description="Multi-agent backend for civic education",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS for specific frontend origin in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://friendly-neighbor.gov.in", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["GET", "POST"], # Block unsafe methods
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
app.include_router(law_library.router, prefix="/api/law-library", tags=["Internal Law Library"])
app.include_router(nri.router, prefix="/api/nri", tags=["NRI Neighbor"])

static_dir = Path(__file__).resolve().parent.parent / "static"

if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")
    icons_dir = static_dir / "icons"
    if icons_dir.exists():
        app.mount("/icons", StaticFiles(directory=icons_dir), name="icons")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        requested_file = static_dir / full_path
        if requested_file.is_file():
            return FileResponse(requested_file)
        return FileResponse(static_dir / "index.html")
