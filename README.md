# 🏘️ Friendly Neighbor — Civic AI

### *"Beyond a Chatbot. Built by a Visionary and Google Antigravity."*

> Your warm, neighborly guide to understanding elections, finding your polling booth, and learning how your vote shapes India.

[![Production Ready](https://img.shields.io/badge/Status-v1.0_Production_Ready-brightgreen)](https://github.com/patil/Friendly-Neighbor-Civic-AI)
[![PWA](https://img.shields.io/badge/PWA-Offline_First-blue)](https://web.dev/progressive-web-apps/)
[![Languages](https://img.shields.io/badge/Languages-EN%20|%20HI%20|%20MR%20|%20TA%20|%20BN-orange)]()

---

## 🎯 What Is This?

**Friendly Neighbor** is *not* another election chatbot. It's a **community-first civic companion** — a PWA that transforms complex election processes into warm, neighborly conversations. Built for India's 2026 State Assembly Elections across **Assam, Kerala, Tamil Nadu, West Bengal, and Puducherry**.

It turns the intimidating bureaucracy of elections into something that feels like getting advice from the wisest, kindest person on your street.

---

## 🏗️ The 6 Layers

### Layer 1: 🗺️ The Neighborhood Sandbox
**Interactive India Constituency Map**
- Click anywhere on the map to discover your Parliamentary and Assembly constituency
- See your nearest polling booth, your representative, and voter turnout data
- **Kids Mode ("Adventure Mode")**: The map becomes a treasure hunt — find the "Great Beep Castle" (your polling booth)!
- Built with **Leaflet.js** and GeoJSON data

### Layer 2: 🛡️ The Misinformation Firewall
**Real-Time Rumor Detection & Gentle Persuasion**
- Monitors for common election misinformation (EVM hacking, ink washing, polling cancellation)
- Instead of cold "FACT CHECK" labels, uses the **Storyteller Agent** for warm, neighborly corrections
- Every fact is linked to **official ECI source documents**
- Multilingual scripts in all 5 languages
- Persistent footer banner: **"Neighborly Pulse"** — always watching, always protecting

### Layer 3: 🎪 The Junior Scout Adventure
**Kids Mode — EVM Education Through Play**
- **The Great Beep**: Vote for your favorite snack on a realistic EVM simulator
- Hear the official 1kHz beep, see the VVPAT paper slip print
- **Shadow Ballot**: Let kids practice the full voting flow
- **Game Master Voice-Over**: Multilingual storyteller explains each step
- **Treasure Hunt**: GPS-guided quest to find your local polling booth

### Layer 4: 🏘️ The Village Square
**Community Q&A with ECI Source Guarantee**
- Pre-loaded with 6 verified Q&A pairs covering the most common election questions
- Users can ask their own questions
- **The Neighbor's Guarantee**: Every answer includes a direct link to the official ECI source
- Designed for offline-first access

### Layer 5: 📊 The Ballot Analyst
**Your Vote's Impact, Visualized**
- **Impact Calculator**: See exactly how many people voted vs stayed home in your constituency
- **Power Meter**: Victory margins from last 2 elections — "just 3,728 votes decided this race!"
- **Street Analogy**: "That's about the number of people who live on 93 streets"
- Real 2024 election data from ECI archives

### Layer 6: 📒 The Results Dashboard & 5-Year Ledger
**Counting Day Prep & Long-Term Accountability**
- **5-Year Promise Ledger**: Track winning candidates' promises for the full term
- **Promise Status Tracking**: Not Started → In Progress → Delivered → Unfulfilled
- **Election Morning Greeting**: Date-triggered, language-aware greeting on polling day
- **Post-Election Mode**: App transitions from "election guide" to "accountability tracker"

---

## 🌐 Multi-Agent Architecture

```
┌──────────────────────────────────────────────┐
│           FRIENDLY NEIGHBOR ECOSYSTEM         │
├──────────────────┬───────────────────────────┤
│  🏗️ ARCHITECT    │  System design & layout    │
│  🔍 RESEARCHER   │  ECI data & verification   │
│  🛡️ GATEKEEPER   │  Kids/Adult mode routing   │
│  📖 STORYTELLER   │  Gentle persuasion scripts │
│  🏘️ NEIGHBOR      │  Warm persona translation  │
│  🎮 GAME MASTER   │  Kids EVM voice-over       │
└──────────────────┴───────────────────────────┘
```

---

## 🌍 Languages Supported

| Code | Language | Script |
|------|----------|--------|
| `en` | English | Latin |
| `hi` | हिन्दी (Hindi) | Devanagari |
| `mr` | मराठी (Marathi) | Devanagari |
| `ta` | தமிழ் (Tamil) | Tamil |
| `bn` | বাংলা (Bengali) | Bengali |

**Special**: On April 29, 2026 (WB Phase 2), West Bengal users automatically receive the Bengali election morning greeting.

---

## 📱 PWA & Offline-First

| Strategy | What's Cached | Why |
|----------|---------------|-----|
| **Cache-First** | App shell, maps, audio, images | Load in < 1 second with ZERO internet |
| **Network-First** | Misinformation firewall, logistics alerts | Always get latest rumor data when online |
| **Stale-While-Revalidate** | i18n language files | Instant multilingual, background refresh |

**Install**: Add to home screen on any Android/iOS browser for native app experience.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 8 |
| **Mapping** | Leaflet.js + React-Leaflet |
| **Styling** | Vanilla CSS + Glassmorphism Design System |
| **Backend** | Python FastAPI + Uvicorn |
| **PWA** | Custom Service Worker + Web App Manifest |
| **Data** | ECI archives, constituency GeoJSON |
| **Fonts** | Outfit, Inter, Noto Sans Devanagari (Google Fonts) |
| **Audio** | Web Audio API (1kHz EVM beep synthesis) |

---

## 📁 Project Structure

```
EEP/
├── frontend/
│   ├── public/
│   │   ├── manifest.json          # PWA manifest
│   │   ├── sw.js                  # Service Worker
│   │   └── icons/                 # PWA icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/               # IndiaMap, TreasureMap
│   │   │   ├── EVM/               # EVMSimulator, GreatBeep, ShadowBallot
│   │   │   ├── Panels/            # NeighborPanel, TimelineBar, VillageSquare,
│   │   │   │                      # ImpactCalculator, PowerMeter, NeighborlyPulse
│   │   │   ├── PollDay/           # ElectionMorning
│   │   │   └── Results/           # FiveYearLedger
│   │   ├── data/                  # JSON data (rumors, scripts, margins, greetings)
│   │   ├── hooks/                 # useLanguage, useKidsMode, useConstituency,
│   │   │                          # useCivicTracker
│   │   ├── i18n/                  # en, hi, mr, ta, bn translations
│   │   └── App.jsx                # Main application
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── agents/                # FriendlyNeighbor, AdventureGuide, MapMaker
│   │   ├── routers/               # constituency, timeline, impact, kids
│   │   └── main.py                # FastAPI entry
│   └── requirements.txt
└── README.md
```

---

## 🚀 Quick Start

```bash
# Frontend
cd frontend
npm install
npm run dev          # → http://localhost:5173

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload  # → http://localhost:8000
```

---

## 📜 The Long-Term Promise

After May 4, 2026 (Counting Day), Friendly Neighbor transitions from an **election guide** into a **5-Year Promise Tracker**. Citizens can:

1. Load winning candidates' promises into the ledger
2. Track status: `Not Started` → `In Progress` → `Delivered` → `Unfulfilled`
3. Export the ledger as a text document
4. Hold representatives accountable — all data stored locally on the device

**The app doesn't end on election day. It becomes the neighborhood's memory.**

---

## 🎬 The Vision

> *"Every Indian voter deserves a warm, patient, knowledgeable neighbor who explains democracy without condescension, checks misinformation without hostility, and celebrates participation without partisanship."*

This is that neighbor.

---

## 📄 License

Educational project for civic engagement. Data sourced from the Election Commission of India (eci.gov.in).

**Disclaimer**: This is a civic education tool. Please verify all official information at [eci.gov.in](https://eci.gov.in). This project is non-partisan and does not endorse any political party.

---

*Project Friendly Neighbor: Beyond a Chatbot. Built by a Visionary and Google Antigravity.* 🏘️🇮🇳
