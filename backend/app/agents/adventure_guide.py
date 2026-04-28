"""
THE ADVENTURE GUIDE AGENT
==========================
Role: Kids' Logic — transforms constituency/EVM data into adventure narratives.
Turns polling booths into castles, constituencies into kingdoms.
"""

ADVENTURE_TRANSFORMS = {
    "polling_station": {"name": "The Great Beep Castle 🏰", "description": "This is where the magic beep happens!"},
    "constituency": {"name": "Your Kingdom 👑", "description": "This is the land you and your neighbors protect!"},
    "voter_id": {"name": "Explorer's Badge 🎖️", "description": "Your official pass to enter the Great Beep Castle!"},
    "evm": {"name": "The Magic Beep Box ✨", "description": "Press the button, hear the beep, and your voice is counted!"},
    "vvpat": {"name": "The Magic Ticket 🎫", "description": "A tiny paper appears for 7 seconds to prove the magic worked!"},
    "mp": {"name": "The Kingdom's Champion 🦸", "description": "The person your neighbors chose to speak for everyone!"},
    "election_day": {"name": "The Great Quest Day 🗓️", "description": "The day when everyone visits the castle!"},
    "ballot": {"name": "The Choice Scroll 📜", "description": "A list of champions to choose from!"},
    "vote": {"name": "Your Power Stone 💎", "description": "One stone per explorer — use it wisely!"},
}

QUEST_MESSAGES = [
    "🗺️ Quest: Find the Great Beep Castle in your Kingdom!",
    "🏰 The castle awaits! Your Explorer's Badge is ready!",
    "⚔️ Every kingdom needs its champions — who will you choose?",
    "🎵 Listen for the magic BEEP — it means your voice was heard!",
    "🌟 You're one step closer to becoming a Master Explorer!",
]


def transform_to_adventure(key: str) -> dict:
    """Transform a technical concept into adventure narrative."""
    return ADVENTURE_TRANSFORMS.get(key, {
        "name": key.replace("_", " ").title(),
        "description": "A mysterious part of the adventure!"
    })


def get_quest_message(index: int = 0) -> str:
    """Get a quest message for the kids mode."""
    return QUEST_MESSAGES[index % len(QUEST_MESSAGES)]


def transform_constituency_for_kids(constituency_data: dict) -> dict:
    """Transform constituency data into adventure-themed narrative."""
    return {
        "kingdom_name": f"The {constituency_data.get('pc_name', 'Unknown')} Kingdom",
        "castle_name": "The Great Beep Castle 🏰",
        "castle_location": constituency_data.get("booth", "Somewhere in the kingdom..."),
        "champion": constituency_data.get("mp", "The Unknown Champion"),
        "quest_message": QUEST_MESSAGES[0],
        "explorer_count": constituency_data.get("total_electors", 0),
        "explorers_who_visited": constituency_data.get("total_voters", 0),
    }
