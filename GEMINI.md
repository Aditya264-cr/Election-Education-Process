# Friendly Neighbor Civic AI — Project Instructions

## 2026 Vision: Proactive Civic Intelligence Engine ("Power Machine")
The application is evolving from a static educational tool into a Proactive Civic Intelligence Engine focused on the 2026 electoral landscape. 

### Core Architectural Pillars
1. **Hyper-Local "Why" Engine:** Don't just show dates; pull data on local infrastructure projects funded in previous cycles to show the direct ROI of a vote.
2. **Misinformation "Firewall" (Sovereign Integrity Protocol):** Provide strict provenance information—tracing every civic fact back to its official ECI source or constitutional amendment (already partially implemented via LGD-Linkage and the Constitutional Engine).
3. **Predictive Polling Navigator:** Utilize historical data to predict the "best time to vote" and avoid queues (Booth Health).
4. **The Civic Debater (Kids' Mode):** Go beyond shadow ballots. The Game Master acts as a friendly debate opponent (e.g., "Why are bananas better than apples?") to teach reasoning.
5. **Overseas NRI Voter Registration:** A specialized "NRI Neighbor" agent to capture and assist the under-served NRI market.

### Technical & Engineering Conventions
- **Frontend (React/Vite):** 
  - UI/UX follows **MNC Standards** (Inter/Roboto, 8pt Grid, Soft Shadows, Zero Emojis, Lucide Icons).
  - **Predictive Navigation:** Use Slide-over Drawers and Progressive Disclosure instead of center-screen modals.
  - **Map Logic:** Strict Point-in-Polygon (PiP) logic via `india_pc_2019.json` boundaries.
- **Backend (FastAPI):**
  - **Parallel Agent Execution:** Optimize endpoints using `asyncio.gather` to orchestrate multiple agents (Map Maker, Researcher, Compliance) simultaneously for high-speed dynamic civic snapshots.
  - **Balanced Responses:** Ensure political neutrality by pulling manifestos from ALL major parties when discussing local promises.

### Deployment & CI/CD
- **Sovereign Audit:** The `scripts/legal_spatial_audit.py` MUST pass before code is merged into `main`.
- **Cloud Run Deployment:** `gcloud builds submit` is used for deployment via `cloudbuild.yaml`.
- **Link Integrity:** The `dead_link_crawler.py` maintains offline sync and secondary mirror links for the Internal Law Library.
