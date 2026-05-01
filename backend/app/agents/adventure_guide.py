"""
THE ADVENTURE GUIDE AGENT & CIVIC DEBATER
==========================================
Role: Kids' Logic & The Game Master — transforms technical data into narratives
and acts as a friendly debate opponent to teach political reasoning.
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

DEBATE_TOPICS = {
    "snacks": {
        "title": "The Great Snack Election",
        "opponent": "The Apple Knight",
        "arguments": [
            "Apples stay crunchy longer than bananas!",
            "You can make apple pie, but banana pie is... well, mushy!",
            "Apples have a built-in handle (the stem)!"
        ],
        "winning_reasoning": "A good explorer listens to all arguments and picks what helps the kingdom (and their tummy) most!"
    }
}

class AdventureGuideAgent:
    """
    Game Master for kids mode.
    """
    def __init__(self):
        self.adventure_map = ADVENTURE_TRANSFORMS
        self.topics = DEBATE_TOPICS

    def transform_concept(self, key: str) -> dict:
        return self.adventure_map.get(key, {"name": key.title(), "description": "A mystery!"})

    def start_debate(self, topic_id: str = "snacks") -> dict:
        """Starts a friendly debate as the Game Master."""
        topic = self.topics.get(topic_id)
        return {
            "agent": "game_master",
            "mode": "civic_debater",
            "title": topic["title"],
            "opponent": topic["opponent"],
            "opening_statement": f"Welcome, Explorer! I am {topic['opponent']}. I believe apples are the best snack for the kingdom. What do you think?",
            "opponent_arguments": topic["arguments"],
            "lesson": topic["winning_reasoning"]
        }

adventure_guide_agent = AdventureGuideAgent()
