from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException

from .db import get_session, init_db
from .models import ChannelConfig
from .orchestrator import Optix
from .schemas import (
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


@app.get("/diagnose")
def diagnose(session=Depends(get_session)):
    optix = Optix(session)
    return optix.diagnose().model_dump()
