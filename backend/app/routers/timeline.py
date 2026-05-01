"""Timeline Router — Election cycle phases (2026 Assembly Elections)."""
from fastapi import APIRouter, Query
from datetime import date, datetime
from app.agents.flow_strategist import flow_strategist_agent

router = APIRouter()

@router.get("/flow-prediction")
async def get_flow_prediction(pc_name: str = Query(..., description="Constituency Name")):
    """
    Predictive Polling Navigator — Flow Strategist endpoint.
    Computes best voting times based on historical peaks and environment.
    """
    return await flow_strategist_agent.get_flow_prediction(pc_name)

ELECTION_PHASES = [
    {"key": "registration", "start": "2026-01-15", "end": "2026-03-20"},
    {"key": "nomination", "start": "2026-03-21", "end": "2026-04-01"},
    {"key": "campaign", "start": "2026-04-02", "end": "2026-04-07"},
    {
        "key": "polling",
        "start": "2026-04-09",
        "end": "2026-04-29",
        "detail": "Apr 9 (Assam/Kerala/Puducherry), Apr 23 (TN/WB-Ph1), Apr 29 (WB-Ph2)",
    },
    {
        "key": "counting",
        "start": "2026-05-04",
        "end": "2026-05-04",
        "detail": "May 4, 2026 — All 5 states counting day",
    },
    {"key": "results", "start": "2026-05-05", "end": "2026-05-05"},
]

COUNTING_STATES = [
    {"name": "Assam", "pollingDate": "2026-04-09", "countingDate": "2026-05-04", "phases": 1},
    {"name": "Kerala", "pollingDate": "2026-04-09", "countingDate": "2026-05-04", "phases": 1},
    {"name": "Tamil Nadu", "pollingDate": "2026-04-23", "countingDate": "2026-05-04", "phases": 1},
    {"name": "West Bengal", "pollingDates": ["2026-04-23", "2026-04-29"], "countingDate": "2026-05-04", "phases": 2},
    {"name": "Puducherry", "pollingDate": "2026-04-09", "countingDate": "2026-05-04", "phases": 1},
]


@router.get("/phases")
async def get_phases():
    """Get all election phases with current status."""
    today = date.today()
    phases = []
    for phase in ELECTION_PHASES:
        start = date.fromisoformat(phase["start"])
        end = date.fromisoformat(phase["end"])
        if today > end:
            status = "completed"
        elif today >= start:
            status = "active"
        else:
            status = "upcoming"

        phases.append({
            **phase,
            "status": status,
            "days_left": (end - today).days if status != "completed" else 0,
        })

    return {"phases": phases}


@router.get("/countdown")
async def get_countdown():
    """Get countdown to counting day (May 4, 2026)."""
    today = date.today()
    counting_day = date(2026, 5, 4)
    days_left = (counting_day - today).days

    return {
        "countingDay": "2026-05-04T08:00:00+05:30",
        "daysLeft": max(0, days_left),
        "states": COUNTING_STATES,
        "source": "Election Commission of India (eci.gov.in)",
    }
