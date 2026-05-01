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

## MISSION: INITIALIZE SELF-EVOLVING CIVIC UNIVERSE
The project is now a "Perpetual Machine." It uses Google Cloud as its body, Gemini as its brain, and this repository as its DNA.

### 1. MULTIMODAL SENSORY INTEGRATION
- **ENABLE:** Gemini 1.5 Pro Vision to process user-uploaded Voter IDs.
- **LOGIC:** Automatically extract constituency data to update the 'User Profile' and map focus without typing.
- **SERVICE:** Vertex AI Multimodal Embeddings.

### 2. RECURSIVE IMPROVEMENT LOOP (AUTO-UPGRADE)
- **AGENT [Architect]:** Monitor `ACCURACY_REPORT.md` and `dead-link-crawler` results.
- **ACTION:** If a 404 is detected or accuracy drops below 100%, the agent must rewrite the `law_library/manifest.json` and push a fix immediately.
- **GOAL:** Zero downtime, zero manual bug-fixing. The Triple-Agent Loop (Observer -> Architect -> Auditor) must manage self-repair.

### 3. AUTONOMOUS SCALING & UNIVERSE EXPANSION
- **INFRASTRUCTURE:** Deploy using GKE Autopilot (Google Kubernetes Engine).
- **LOGIC:** During 'Counting Day' (May 4th), agents must detect traffic spikes via Cloud Monitoring.
- **ACTION:** Autonomously spin up additional regional nodes in Google Cloud's 'asia-south1' (Mumbai) and 'asia-south2' (Delhi) to maintain microsecond latency.

### 4. THE NEIGHBORLY WISDOM (EMBEDDED INTELLIGENCE)
- **FEATURE:** Use Vertex AI Search to 'ground' the Neighbor Persona.
- **RULE:** Every response must be cross-referenced against the `statutes/rpa_1951.md` stored in the Law Library.
- **OUTPUT:** If the law changes in Parliament, the agent must detect the new Gazette, update the `.md` file, and notify all affected 'Neighbors' via Firebase Cloud Messaging.

### 5. AUTONOMOUS CONTENT CREATION
- **AI Video Tutorials:** Use Google's Imagen/Video models to generate localized "How to Vote" videos in regional languages, customized with specific local landmarks.
- **Autonomous Newsroom:** The Researcher Squad compiles a daily "Neighborhood Civic Digest" from Google News, presented via the Dynamic Home interface.

