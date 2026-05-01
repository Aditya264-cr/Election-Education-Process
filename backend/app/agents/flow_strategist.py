"""
THE FLOW STRATEGIST AGENT
=========================
Role: Queue Whisperer — handles the predictive math for booth flow.
Integrates historical turnout patterns and environmental data to recommend
the 'Best Time to Vote' while ensuring neutrality.
"""
from typing import Dict, List, Any
import random
import asyncio

class FlowStrategistAgent:
    """
    Agent for computing 'Smooth-Flow Scores' and predicting booth congestion.
    """
    def __init__(self):
        # Mock historical hourly turnout percentages (normalized)
        # 7AM-8AM, 8AM-9AM ... 5PM-6PM
        self.historical_hourly_peaks = [0.15, 0.12, 0.08, 0.07, 0.06, 0.05, 0.08, 0.12, 0.15, 0.12]
        
    async def get_flow_prediction(self, pc_name: str) -> Dict[str, Any]:
        """
        Computes a 'Smooth-Flow Score' (1-10) for every hour.
        Factors: Historical peaks + Mock Weather (Maharashtra Heatwave simulation).
        """
        # Simulate BigQuery/Weather API latency
        await asyncio.sleep(random.uniform(0.1, 0.2))
        
        # Mock weather for Maharashtra (Nashik/Pune)
        is_heatwave = pc_name in ["Nashik", "Pune"]
        predicted_temp = 43 if is_heatwave else 34
        
        hourly_predictions = []
        hours = ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
                 "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]
        
        for i, hour in enumerate(hours[:-1]):
            historical_peak = self.historical_hourly_peaks[i]
            # Logic: If it's a heatwave, flow drops in afternoon, peaks early morning
            heat_impact = 0.2 if (is_heatwave and i > 4) else 0
            
            # Smooth-flow score: inverse of (peak + heat_impact)
            raw_score = 1.0 - (historical_peak + heat_impact)
            score = max(1, min(10, int(raw_score * 10)))
            
            status = "Recommended" if score >= 8 else "Busy" if score <= 4 else "Moderate"
            
            hourly_predictions.append({
                "time_slot": f"{hour} - {hours[i+1]}",
                "score": score,
                "status": status,
                "is_recommended": status == "Recommended"
            })
            
        # Proactive Neighbor Alert logic
        alert = None
        if predicted_temp > 40:
            alert = {
                "severity": "high",
                "message": f"Neighbor, it's going to be a hot one ({predicted_temp}°C)! Historical data suggests the shortest lines and coolest air are between 7:00 AM and 8:30 AM. Don't forget your water bottle!"
            }

        return {
            "agent": "flow_strategist",
            "pc_name": pc_name,
            "predicted_temp": predicted_temp,
            "hourly_flow": hourly_predictions,
            "neighbor_alert": alert,
            "best_slot": next((h["time_slot"] for h in hourly_predictions if h["is_recommended"]), "7:00 AM - 8:00 AM")
        }

flow_strategist_agent = FlowStrategistAgent()
