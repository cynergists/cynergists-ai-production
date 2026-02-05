# Optix — YouTube Organic Growth AI Agent (MVP)

Optix is a local-first, API-ready system that helps you maintain a Channel Bible, generate and score video ideas, produce packaging and scripts, draft publishing assets, and analyze performance to suggest next experiments.

## Features
- Channel Bible + Content Pillars
- Idea generation with deterministic scoring
- Packaging (titles + thumbnail concepts)
- Outlines/scripts with retention resets
- Publishing assets (description, chapters, endscreen, pinned comment, community post, shorts plan)
- Metrics ingestion (YouTube Data API v3 if available, stubbed otherwise)
- Diagnostics + experiment suggestions
- CLI workflow with weekly cadence

## Setup
```bash
cd optix
python -m venv .venv
source .venv/bin/activate
pip install -e .
cp .env.example .env
```

Set your keys in `.env`:
- `OPENAI_API_KEY` (optional for MVP; used by `optix/llm.py`)
- `GOOGLE_API_KEY` (optional for YouTube Data API v3)

## CLI Usage
```bash
# Initialize DB and seed a sample Channel Bible
optix init

# Create/update ChannelConfig
optix channel set --name "Optix Academy" --niche "YouTube growth" --target-viewer "new creators" --promise "Actionable growth systems"

# Refresh backlog (research + ideation + scoring)
optix backlog refresh --count 30

# Build packages for top ideas
optix package build --top 3

# Ingest metrics (stub if no API key)
optix metrics ingest --days 14

# Diagnose performance and print next experiments
optix diagnose

# Weekly run
optix weekly --top 3 --count 30
```

## API Endpoints
Run the API:
```bash
uvicorn optix.main:app --reload
```

Endpoints:
- `GET /health`
- `GET /channel`
- `POST /channel`
- `POST /backlog/refresh`
- `POST /package/build`
- `POST /metrics/ingest`
- `GET /diagnose`

## Modules Overview
- `modules/research.py`: placeholder research + optional YouTube search.
- `modules/ideation.py`: deterministic idea generation + scoring rubric.
- `modules/packaging.py`: titles + thumbnail concepts and rationale.
- `modules/scripting.py`: hooks, outline, script, and pattern breaks.
- `modules/publishing.py`: publishing assets (description, chapters, etc.).
- `modules/analytics.py`: diagnostics and experiment suggestions.

## Scoring Rubric
Each idea is scored with weighted factors:
- `pain_intensity` (0-5)
- `search_intent` (0-5)
- `trend_leverage` (0-5)
- `click_potential` (0-5)
- `production_complexity` (0-5, inverted)
- `channel_fit` (0-5)

`score_total` is a weighted sum. Production complexity is inverted so higher complexity reduces total score.

## Notes
- YouTube Data API v3 does not provide impressions/CTR/AVD; Optix stubs these unless you expand to the Analytics API.
- This MVP avoids policy-violating “growth hacks” and focuses on clarity, retention, and value.
