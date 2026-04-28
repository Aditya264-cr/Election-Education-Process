# 🏘️ Friendly Neighbor — Civic AI

> *"Your civic journey starts right here at home."*

A warm, community-driven civic education platform that transforms dry election data into an engaging neighborhood experience for Indian citizens — adults and children alike.

![Technology](https://img.shields.io/badge/React-Vite-blue?logo=react)
![Backend](https://img.shields.io/badge/FastAPI-Python-green?logo=fastapi)
![Map](https://img.shields.io/badge/Leaflet-OpenStreetMap-orange?logo=leaflet)
![Languages](https://img.shields.io/badge/i18n-EN%20%7C%20HI%20%7C%20MR-saffron)

## ✨ Features

### 🗺️ Interactive India Map
- Click anywhere to discover your constituency, polling booth, and representative
- Choropleth coloring by voter turnout
- Auto-detect user location via geolocation

### 🏰 Kids' Adventure Mode
- Map transforms into a Treasure Map with castle icons
- Polling booth = "The Great Beep Castle"
- Shadow Ballot: Kids can "vote" on fun topics and learn how democracy works
- Musical beep sounds and confetti celebrations

### 🗳️ EVM Simulator
- Real EVM layout with Ballot Unit + Control Unit
- Authentic 1kHz beep via Web Audio API
- VVPAT paper slip animation (7-second display — like the real thing!)
- Step-by-step "What does the beep mean?" explainer

### 📊 Impact Calculator
- Shows how many neighbors voted in your constituency
- 100-dot grid visualization
- Comparison bar: Your Area vs. National Average
- Motivational messaging: "Your vote is 1 in 19,42,580 — that's powerful!"

### 📅 Dynamic Election Timeline
- Visual phase tracker: Registration → Polling → Results
- Shows current phase with countdown

### 🌐 Trilingual Support
- English, Hindi (हिंदी), Marathi (मराठी)
- All labels use warm "neighborly" tone instead of bureaucratic language

## 🏗️ Architecture

```
├── backend/               (FastAPI — Multi-Agent System)
│   ├── agents/
│   │   ├── map_maker.py          # Constituency lookup
│   │   ├── friendly_neighbor.py  # Label transformation
│   │   └── adventure_guide.py    # Kids mode logic
│   └── routers/
│       ├── constituency.py
│       ├── timeline.py
│       ├── impact.py
│       └── kids.py
│
├── frontend/              (React + Vite)
│   └── src/
│       ├── components/
│       │   ├── Map/IndiaMap.jsx
│       │   ├── EVM/EVMSimulator.jsx
│       │   ├── EVM/ShadowBallot.jsx
│       │   └── Panels/...
│       ├── hooks/
│       └── i18n/
```

## 🚀 Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 📜 Data Disclaimer
Constituency boundary and turnout data is sourced from community databases (DataMeet). Always verify official information with the [Election Commission of India](https://eci.gov.in).

## 📄 License
MIT
