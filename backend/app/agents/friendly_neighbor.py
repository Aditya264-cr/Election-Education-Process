"""
THE FRIENDLY NEIGHBOR AGENT
============================
Role: The Vibe Engine — transforms technical election jargon into
warm, neighborly language across English, Hindi, and Marathi.
"""
import json
import os

LABEL_TRANSFORMS = {
    "en": {
        "constituency_details": "What's Happening in Our Area",
        "parliamentary_constituency": "Your Parliamentary Area",
        "assembly_constituency": "Your Assembly Area",
        "voter_turnout": "How Many Neighbors Voted",
        "polling_station": "Your Voting Spot",
        "member_of_parliament": "Your Representative",
        "election_commission": "The Election Team",
        "voter_id": "Your Voter Card",
        "electoral_roll": "The Neighbor List",
        "nomination": "People Stepping Up to Help",
        "campaign_period": "When Leaders Come to Talk",
        "results": "The Big Day — Results!",
    },
    "hi": {
        "constituency_details": "हमारे इलाके में क्या चल रहा है",
        "parliamentary_constituency": "आपका संसदीय क्षेत्र",
        "assembly_constituency": "आपका विधानसभा क्षेत्र",
        "voter_turnout": "कितने पड़ोसियों ने वोट दिया",
        "polling_station": "आपका वोटिंग स्थान",
        "member_of_parliament": "आपके जनप्रतिनिधि",
        "election_commission": "चुनाव की टीम",
        "voter_id": "आपका वोटर कार्ड",
        "electoral_roll": "पड़ोसियों की सूची",
        "nomination": "लोग मदद के लिए आगे आए",
        "campaign_period": "जब नेता बात करने आते हैं",
        "results": "बड़ा दिन — नतीजे!",
    },
    "mr": {
        "constituency_details": "आपल्या भागात काय चाललंय",
        "parliamentary_constituency": "तुमचा संसदीय मतदारसंघ",
        "assembly_constituency": "तुमचा विधानसभा मतदारसंघ",
        "voter_turnout": "किती शेजाऱ्यांनी मतदान केले",
        "polling_station": "तुमचे मतदान केंद्र",
        "member_of_parliament": "तुमचे लोकप्रतिनिधी",
        "election_commission": "निवडणूक संघ",
        "voter_id": "तुमचे मतदार ओळखपत्र",
        "electoral_roll": "शेजाऱ्यांची यादी",
        "nomination": "लोक मदतीसाठी पुढे आले",
        "campaign_period": "नेते बोलायला येतात तेव्हा",
        "results": "मोठा दिवस — निकाल!",
    },
}


def transform_label(key: str, lang: str = "en") -> str:
    """Convert a technical label key into neighborly language."""
    return LABEL_TRANSFORMS.get(lang, LABEL_TRANSFORMS["en"]).get(
        key, key.replace("_", " ").title()
    )


def transform_constituency_data(data: dict, lang: str = "en") -> dict:
    """Transform all keys in constituency data to neighborly labels."""
    result = {}
    for key, value in data.items():
        friendly_key = transform_label(key, lang)
        result[friendly_key] = value
    return result
