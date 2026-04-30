"""
THE MAP-MAKER AGENT
===================
Role: Lead Researcher — constituency lookup via point-in-polygon on GeoJSON boundaries.
Uses GeoJSON data for accurate boundary lookup.
"""
import json
import os
from typing import Optional
from pydantic import BaseModel


class ConstituencyResult(BaseModel):
    pc_name: str
    pc_no: int
    ac_name: str
    state: str
    mp: str
    booth: str
    total_electors: int
    total_voters: int
    turnout_2024: float
    turnout_2019: float


# Sample dataset — in production, loaded from GeoJSON + database
CONSTITUENCY_DATA = [
    ConstituencyResult(pc_name="Mumbai North", pc_no=1, ac_name="Borivali", state="Maharashtra", mp="Piyush Goyal", booth="St. Xavier's High School, Borivali West", total_electors=1896542, total_voters=937072, turnout_2024=49.42, turnout_2019=51.78),
    ConstituencyResult(pc_name="Mumbai South", pc_no=2, ac_name="Colaba", state="Maharashtra", mp="Arvind Sawant", booth="Municipal School, Colaba", total_electors=1642318, total_voters=859050, turnout_2024=52.31, turnout_2019=48.92),
    ConstituencyResult(pc_name="Pune", pc_no=3, ac_name="Kothrud", state="Maharashtra", mp="Murlidhar Mohol", booth="DAV Public School, Kothrud", total_electors=2143650, total_voters=1049515, turnout_2024=48.96, turnout_2019=49.89),
    ConstituencyResult(pc_name="New Delhi", pc_no=4, ac_name="New Delhi", state="Delhi", mp="Bansuri Swaraj", booth="Govt. Boys School, Barakhamba Road", total_electors=1478236, total_voters=810700, turnout_2024=54.83, turnout_2019=60.21),
    ConstituencyResult(pc_name="Varanasi", pc_no=5, ac_name="Varanasi City", state="Uttar Pradesh", mp="Narendra Modi", booth="Govt. Inter College, Varanasi", total_electors=1892451, total_voters=1065010, turnout_2024=56.29, turnout_2019=55.40),
    ConstituencyResult(pc_name="Lucknow", pc_no=6, ac_name="Lucknow Cantt", state="Uttar Pradesh", mp="Rajnath Singh", booth="Kendriya Vidyalaya, Lucknow Cantt", total_electors=1942580, total_voters=975312, turnout_2024=50.21, turnout_2019=52.89),
    ConstituencyResult(pc_name="Chennai South", pc_no=7, ac_name="Mylapore", state="Tamil Nadu", mp="Thamizhachi Thangapandian", booth="Corporation School, Mylapore", total_electors=1756820, total_voters=1021089, turnout_2024=58.11, turnout_2019=61.35),
    ConstituencyResult(pc_name="Bengaluru South", pc_no=8, ac_name="Jayanagar", state="Karnataka", mp="Tejasvi Surya", booth="Govt. High School, Jayanagar", total_electors=2089400, total_voters=1143322, turnout_2024=54.72, turnout_2019=53.67),
]

# Load GeoJSON data for accurate boundary lookup
_GEOJSON_DATA = None
_GEOJSON_LOADED = False


def _load_geojson():
    global _GEOJSON_DATA, _GEOJSON_LOADED
    if _GEOJSON_LOADED:
        return
    try:
        # Navigate from backend/app/agents/map_maker.py to frontend/src/data/india_pc_2019.json
        geojson_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'frontend', 'src', 'data', 'india_pc_2019.json')
        with open(geojson_path, 'r', encoding='utf-8') as f:
            _GEOJSON_DATA = json.load(f)
        _GEOJSON_LOADED = True
    except Exception as e:
        print(f"Warning: Could not load GeoJSON data for map maker: {e}")
        _GEOJSON_DATA = {"type": "FeatureCollection", "features": []}


def point_in_polygon(lat: float, lng: float, polygon_coords: list) -> bool:
    """
    Ray casting algorithm to check if point is inside polygon.
    Args:
        lat: Latitude of point
        lng: Longitude of point
        polygon_coords: List of [lng, lat] pairs representing the polygon vertices
    Returns:
        True if point is inside polygon, False otherwise
    """
    inside = False
    j = len(polygon_coords) - 1
    for i in range(len(polygon_coords)):
        xi, yi = polygon_coords[i]
        xj, yj = polygon_coords[j]
        # Check if point is inside the polygon
        intersect = ((yi > lat) != (yj > lat)) and (lng < (xj - xi) * (lat - yi) / (yj - yi + 1e-10) + xi)
        if intersect:
            inside = not inside
        j = i
    return inside


def lookup_constituency(lat: float, lng: float) -> Optional[ConstituencyResult]:
    """
    Point-in-polygon lookup using GeoJSON boundaries.
    Returns None if coordinate is not found in any constituency polygon.
    Implements coordinate validation: verifies that coordinate matches polygon property.
    """
    # Validate coordinate bounds (India approximate)
    if not (6 <= lat <= 37 and 68 <= lng <= 98):
        return None

    # Load GeoJSON data if not already loaded
    _load_geojson()

    # Search through GeoJSON features for point-in-polygon match
    for feature in _GEOJSON_DATA.get("features", []):
        if feature.get("geometry", {}).get("type") != "Polygon":
            continue
        properties = feature.get("properties", {})
        coordinates = feature.get("geometry", {}).get("coordinates", [])
        if not coordinates:
            continue

        # Handle MultiPolygon (though our data is simple Polygon)
        polygons = coordinates[0] if isinstance(coordinates[0][0], list) else [coordinates[0]]

        for polygon in polygons:
            if point_in_polygon(lat, lng, polygon):
                # Found matching constituency - now validate against sample data
                pc_name = properties.get("pc_name")
                if not pc_name:
                    continue

                # Find matching constituency in our sample data to get full details
                for constituency in CONSTITUENCY_DATA:
                    if constituency.pc_name == pc_name:
                        # Coordinate validation passed: return verified constituency data
                        return constituency
                # If pc_name not found in sample data, still return None to avoid guesswork
                return None

    # Never guess a random constituency - return None if no match found
    return None
