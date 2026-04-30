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
    lgd_code: str
    ac_no: int
    ac_name: str
    state: str
    mp: str
    booth: str
    total_electors: int
    total_voters: int
    turnout_2024: float
    turnout_2019: float


CONSTITUENCY_DATA = [
    ConstituencyResult(pc_name="Mumbai North", pc_no=1, lgd_code="LGD-MH-MUMBN-PC01", ac_no=152, ac_name="Borivali", state="Maharashtra", mp="Piyush Goyal", booth="St. Xavier's High School, Borivali West", total_electors=1896542, total_voters=937072, turnout_2024=49.42, turnout_2019=51.78),
    ConstituencyResult(pc_name="Mumbai South", pc_no=2, lgd_code="LGD-MH-MUMBS-PC02", ac_no=187, ac_name="Colaba", state="Maharashtra", mp="Arvind Sawant", booth="Municipal School, Colaba", total_electors=1642318, total_voters=859050, turnout_2024=52.31, turnout_2019=48.92),
    ConstituencyResult(pc_name="Pune", pc_no=3, lgd_code="LGD-MH-PUNE-PC03", ac_no=210, ac_name="Kothrud", state="Maharashtra", mp="Murlidhar Mohol", booth="DAV Public School, Kothrud", total_electors=2143650, total_voters=1049515, turnout_2024=48.96, turnout_2019=49.89),
    ConstituencyResult(pc_name="New Delhi", pc_no=4, lgd_code="LGD-DL-ND-PC04", ac_no=40, ac_name="New Delhi", state="Delhi", mp="Bansuri Swaraj", booth="Govt. Boys School, Barakhamba Road", total_electors=1478236, total_voters=810700, turnout_2024=54.83, turnout_2019=60.21),
    ConstituencyResult(pc_name="Varanasi", pc_no=5, lgd_code="LGD-UP-VAR-PC05", ac_no=388, ac_name="Varanasi City", state="Uttar Pradesh", mp="Narendra Modi", booth="Govt. Inter College, Varanasi", total_electors=1892451, total_voters=1065010, turnout_2024=56.29, turnout_2019=55.40),
    ConstituencyResult(pc_name="Lucknow", pc_no=6, lgd_code="LGD-UP-LKO-PC06", ac_no=175, ac_name="Lucknow Cantt", state="Uttar Pradesh", mp="Rajnath Singh", booth="Kendriya Vidyalaya, Lucknow Cantt", total_electors=1942580, total_voters=975312, turnout_2024=50.21, turnout_2019=52.89),
    ConstituencyResult(pc_name="Chennai South", pc_no=7, lgd_code="LGD-TN-CHS-PC07", ac_no=25, ac_name="Mylapore", state="Tamil Nadu", mp="Thamizhachi Thangapandian", booth="Corporation School, Mylapore", total_electors=1756820, total_voters=1021089, turnout_2024=58.11, turnout_2019=61.35),
    ConstituencyResult(pc_name="Bengaluru South", pc_no=8, lgd_code="LGD-KA-BLS-PC08", ac_no=173, ac_name="Jayanagar", state="Karnataka", mp="Tejasvi Surya", booth="Govt. High School, Jayanagar", total_electors=2089400, total_voters=1143322, turnout_2024=54.72, turnout_2019=53.67),
    ConstituencyResult(pc_name="Ahmedabad East", pc_no=9, lgd_code="LGD-GJ-AHME-PC09", ac_no=53, ac_name="Maninagar", state="Gujarat", mp="Hasmukhbhai Patel", booth="Sabarmati Primary School, Maninagar", total_electors=1824300, total_voters=955580, turnout_2024=52.35, turnout_2019=54.10),
    ConstituencyResult(pc_name="Kolkata North", pc_no=10, lgd_code="LGD-WB-KOLN-PC10", ac_no=167, ac_name="Shyampukur", state="West Bengal", mp="Sudip Bandyopadhyay", booth="Kolkata Municipal School, Shyampukur", total_electors=1589400, total_voters=988150, turnout_2024=62.18, turnout_2019=67.05),
    ConstituencyResult(pc_name="Jaipur City", pc_no=11, lgd_code="LGD-RJ-JAIP-PC11", ac_no=51, ac_name="Civil Lines", state="Rajasthan", mp="Ramcharan Bohra", booth="Jaipur Nagar Nigam Hall, Civil Lines", total_electors=1952300, total_voters=1195000, turnout_2024=61.20, turnout_2019=63.50),
]

_GEOJSON_DATA = None
_GEOJSON_LOADED = False


def _load_geojson():
    global _GEOJSON_DATA, _GEOJSON_LOADED
    if _GEOJSON_LOADED:
        return
    try:
        geojson_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'frontend', 'src', 'data', 'india_pc_2019.json')
        with open(geojson_path, 'r', encoding='utf-8') as f:
            _GEOJSON_DATA = json.load(f)
        _GEOJSON_LOADED = True
    except Exception as e:
        print(f"Warning: Could not load GeoJSON data for map maker: {e}")
        _GEOJSON_DATA = {"type": "FeatureCollection", "features": []}


def point_in_polygon(lat: float, lng: float, polygon_coords: list) -> bool:
    inside = False
    j = len(polygon_coords) - 1
    for i in range(len(polygon_coords)):
        xi, yi = polygon_coords[i]
        xj, yj = polygon_coords[j]
        intersect = ((yi > lat) != (yj > lat)) and (lng < (xj - xi) * (lat - yi) / (yj - yi + 1e-10) + xi)
        if intersect:
            inside = not inside
        j = i
    return inside


def _validate_coordinate_match(lat: float, lng: float, properties: dict) -> bool:
    """Coordinate validation gate: ensure lat/lng also aligns with declared constituency center and labels."""
    center_lat = properties.get("center_lat")
    center_lng = properties.get("center_lng")
    if center_lat is None or center_lng is None:
        return False
    # Safety radius check (~125km) to avoid API/UI mismatch regressions.
    return abs(float(center_lat) - lat) < 1.2 and abs(float(center_lng) - lng) < 1.2


def _find_constituency_record(properties: dict) -> Optional[ConstituencyResult]:
    pc_no = properties.get("pc_no")
    pc_name = properties.get("pc_name")
    state = properties.get("state")
    lgd_code = properties.get("lgd_code")
    ac_no = properties.get("ac_no")
    for constituency in CONSTITUENCY_DATA:
        if (
            constituency.pc_no == pc_no
            and constituency.pc_name == pc_name
            and constituency.state == state
            and constituency.lgd_code == lgd_code
            and constituency.ac_no == ac_no
        ):
            return constituency
    return None


def verify_lgd_database_linkage(properties: dict, record: ConstituencyResult) -> bool:
    """Display gate: selected polygon LGD/AC must exactly match database LGD/AC."""
    return (
        properties.get("lgd_code") == record.lgd_code
        and properties.get("ac_no") == record.ac_no
        and properties.get("pc_no") == record.pc_no
    )


def lookup_constituency(lat: float, lng: float) -> Optional[ConstituencyResult]:
    if not (6 <= lat <= 37 and 68 <= lng <= 98):
        return None

    _load_geojson()

    for feature in _GEOJSON_DATA.get("features", []):
        if feature.get("geometry", {}).get("type") != "Polygon":
            continue
        properties = feature.get("properties", {})
        coordinates = feature.get("geometry", {}).get("coordinates", [])
        if not coordinates:
            continue

        polygon = coordinates[0]
        if point_in_polygon(lat, lng, polygon):
            if not _validate_coordinate_match(lat, lng, properties):
                return None
            record = _find_constituency_record(properties)
            if record and verify_lgd_database_linkage(properties, record):
                return record
            return None

    return None
