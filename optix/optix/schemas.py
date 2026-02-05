from __future__ import annotations

from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class ChannelConfigBase(BaseModel):
    channel_name: str
    niche: Optional[str] = None
    target_viewer: Optional[str] = None
    channel_promise: Optional[str] = None
    tone_voice: Optional[str] = None
    pillars_json: list[str] | None = None
    constraints_json: dict[str, Any] | None = None


class ChannelConfigCreate(ChannelConfigBase):
    pass


class ChannelConfigRead(ChannelConfigBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class VideoIdeaBase(BaseModel):
    pillar: Optional[str] = None
    idea_one_liner: str
    viewer_problem: Optional[str] = None
    angle: Optional[str] = None
    search_or_trend: Optional[str] = None
    complexity: Optional[int] = None
    click_potential: Optional[int] = None
    score_total: Optional[float] = None
    score_breakdown_json: dict[str, Any] | None = None
    status: Optional[str] = None


class VideoIdeaCreate(VideoIdeaBase):
    pass


class VideoIdeaRead(VideoIdeaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class VideoIdeaSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pillar: Optional[str] = None
    idea_one_liner: str
    score_total: Optional[float] = None
    status: Optional[str] = None
    created_at: datetime


class VideoAssetBase(BaseModel):
    idea_id: int
    titles_json: list[str] | None = None
    thumbnail_concepts_json: list[str] | None = None
    outline_md: Optional[str] = None
    script_md: Optional[str] = None
    description_md: Optional[str] = None
    chapters_json: list[str] | None = None
    endscreen_plan_md: Optional[str] = None
    pinned_comment_md: Optional[str] = None
    community_post_md: Optional[str] = None
    shorts_plan_md: Optional[str] = None


class VideoAssetCreate(VideoAssetBase):
    pass


class VideoAssetRead(VideoAssetBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class VideoAssetSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    idea_id: int
    titles_json: list[str] | None = None
    thumbnail_concepts_json: list[str] | None = None
    created_at: datetime


class MetricSnapshotBase(BaseModel):
    youtube_video_id: Optional[str] = None
    idea_id: Optional[int] = None
    snapshot_date: date
    impressions: Optional[int] = None
    ctr: Optional[float] = None
    views: int
    avg_view_duration: Optional[float] = None
    avg_view_percentage: Optional[float] = None
    subs_gained: Optional[int] = None
    notes_json: dict[str, Any] | None = None


class MetricSnapshotCreate(MetricSnapshotBase):
    pass


class MetricSnapshotRead(MetricSnapshotBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ExperimentBase(BaseModel):
    name: str
    hypothesis: Optional[str] = None
    change: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    status: Optional[str] = None
    outcome_json: dict[str, Any] | None = None


class ExperimentCreate(ExperimentBase):
    pass


class ExperimentRead(ExperimentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ResearchOutput(BaseModel):
    competitor_notes: str
    trend_notes: str
    topic_clusters: list[dict[str, Any]]


class IdeaScore(BaseModel):
    pain_intensity: int = Field(ge=0, le=5)
    search_intent: int = Field(ge=0, le=5)
    trend_leverage: int = Field(ge=0, le=5)
    click_potential: int = Field(ge=0, le=5)
    production_complexity: int = Field(ge=0, le=5)
    channel_fit: int = Field(ge=0, le=5)


class PackagingOutput(BaseModel):
    titles: list[str]
    thumbnail_concepts: list[str]
    rationale: str


class ScriptingOutput(BaseModel):
    hook_options: list[str]
    outline_md: str
    script_md: str
    pattern_breaks: list[str]


class PublishingOutput(BaseModel):
    description_md: str
    chapters: list[str]
    endscreen_plan_md: str
    pinned_comment_md: str
    community_post_md: str
    shorts_plan_md: str


class VideoDiagnosis(BaseModel):
    youtube_video_id: Optional[str] = None
    idea_id: Optional[int] = None
    issue: str
    reasoning: str
    experiment: str


class AnalyticsOutput(BaseModel):
    diagnoses: list[VideoDiagnosis]
    top_issues: list[str]
    experiments: list[str]


class BacklogRefreshRequest(BaseModel):
    count: int = 30


class PackageBuildRequest(BaseModel):
    top: int = 3


class MetricsIngestRequest(BaseModel):
    days: int = 14


class BacklogRefreshResponse(BaseModel):
    created: int
    ideas: list[VideoIdeaSummary]


class PackageBuildResponse(BaseModel):
    created: int
    assets: list[VideoAssetSummary]
