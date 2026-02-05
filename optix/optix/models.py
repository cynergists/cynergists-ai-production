from __future__ import annotations

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship

from .db import Base, utcnow


class ChannelConfig(Base):
    __tablename__ = "channel_configs"

    id = Column(Integer, primary_key=True)
    channel_name = Column(String, nullable=False)
    niche = Column(String, nullable=True)
    target_viewer = Column(String, nullable=True)
    channel_promise = Column(String, nullable=True)
    tone_voice = Column(String, nullable=True)
    pillars_json = Column(JSON, nullable=True)
    constraints_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)


class VideoIdea(Base):
    __tablename__ = "video_ideas"

    id = Column(Integer, primary_key=True)
    pillar = Column(String, nullable=True)
    idea_one_liner = Column(Text, nullable=False)
    viewer_problem = Column(Text, nullable=True)
    angle = Column(Text, nullable=True)
    search_or_trend = Column(String, nullable=True)
    complexity = Column(Integer, nullable=True)
    click_potential = Column(Integer, nullable=True)
    score_total = Column(Float, nullable=True)
    score_breakdown_json = Column(JSON, nullable=True)
    status = Column(String, default="new")
    created_at = Column(DateTime, default=utcnow)

    assets = relationship("VideoAsset", back_populates="idea")


class VideoAsset(Base):
    __tablename__ = "video_assets"

    id = Column(Integer, primary_key=True)
    idea_id = Column(Integer, ForeignKey("video_ideas.id"), nullable=False)
    titles_json = Column(JSON, nullable=True)
    thumbnail_concepts_json = Column(JSON, nullable=True)
    outline_md = Column(Text, nullable=True)
    script_md = Column(Text, nullable=True)
    description_md = Column(Text, nullable=True)
    chapters_json = Column(JSON, nullable=True)
    endscreen_plan_md = Column(Text, nullable=True)
    pinned_comment_md = Column(Text, nullable=True)
    community_post_md = Column(Text, nullable=True)
    shorts_plan_md = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    idea = relationship("VideoIdea", back_populates="assets")


class MetricSnapshot(Base):
    __tablename__ = "metric_snapshots"

    id = Column(Integer, primary_key=True)
    youtube_video_id = Column(String, nullable=True)
    idea_id = Column(Integer, ForeignKey("video_ideas.id"), nullable=True)
    snapshot_date = Column(Date, nullable=False)
    impressions = Column(Integer, nullable=True)
    ctr = Column(Float, nullable=True)
    views = Column(Integer, nullable=False)
    avg_view_duration = Column(Float, nullable=True)
    avg_view_percentage = Column(Float, nullable=True)
    subs_gained = Column(Integer, nullable=True)
    notes_json = Column(JSON, nullable=True)


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    hypothesis = Column(Text, nullable=True)
    change = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String, default="planned")
    outcome_json = Column(JSON, nullable=True)
