from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import get_session, init_db
from .models import ChannelConfig
from .orchestrator import Optix
from .schemas import (
    AnalyticsOutput,
    BacklogRefreshResponse,
    BacklogRefreshRequest,
    ChannelConfigCreate,
    ChannelConfigRead,
    MetricsIngestRequest,
    PackageBuildResponse,
    PackageBuildRequest,
    VideoAssetSummary,
    VideoIdeaSummary,
)

app = FastAPI(title="Optix")

settings = get_settings()
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
]

if settings.cors_allow_origins:
    allow_origins = [origin.strip() for origin in settings.cors_allow_origins.split(",") if origin.strip()]
else:
    allow_origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok", "app": "Optix"}


@app.get("/channel", response_model=ChannelConfigRead)
def get_channel(session=Depends(get_session)):
    channel = session.query(ChannelConfig).order_by(ChannelConfig.id.desc()).first()
    if not channel:
        raise HTTPException(status_code=404, detail="ChannelConfig not set")
    return channel


@app.post("/channel", response_model=ChannelConfigRead)
def set_channel(payload: ChannelConfigCreate, session=Depends(get_session)):
    optix = Optix(session)
    return optix.bootstrap_channel(payload)


@app.post("/backlog/refresh", response_model=BacklogRefreshResponse)
def refresh_backlog(payload: BacklogRefreshRequest, session=Depends(get_session)):
    optix = Optix(session)
    ideas = optix.refresh_backlog(count=payload.count)
    return BacklogRefreshResponse(
        created=len(ideas),
        ideas=[VideoIdeaSummary.model_validate(idea) for idea in ideas],
    )


@app.post("/package/build", response_model=PackageBuildResponse)
def package_build(payload: PackageBuildRequest, session=Depends(get_session)):
    optix = Optix(session)
    assets = optix.build_video_package(top=payload.top)
    return PackageBuildResponse(
        created=len(assets),
        assets=[VideoAssetSummary.model_validate(asset) for asset in assets],
    )


@app.post("/metrics/ingest")
def ingest_metrics(payload: MetricsIngestRequest, session=Depends(get_session)):
    optix = Optix(session)
    snapshots = optix.ingest_metrics(days=payload.days)
    return {"created": len(snapshots)}


@app.get("/diagnose", response_model=AnalyticsOutput)
def diagnose(session=Depends(get_session)) -> AnalyticsOutput:
    optix = Optix(session)
    return optix.diagnose()
