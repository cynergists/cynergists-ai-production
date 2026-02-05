from __future__ import annotations

import logging
from datetime import date

from sqlalchemy import select

from .config import get_settings
from .models import ChannelConfig, Experiment, MetricSnapshot, VideoAsset, VideoIdea
from .modules import analytics, ideation, packaging, publishing, research, scripting
from .schemas import ChannelConfigCreate, VideoAssetCreate
from .services.youtube import YouTubeService

logger = logging.getLogger("optix")
logging.basicConfig(level=logging.INFO)


class Optix:
    def __init__(self, session):
        self.session = session
        settings = get_settings()
        self.youtube = YouTubeService(settings.google_api_key)

    def _get_channel(self) -> ChannelConfig:
        channel = self.session.execute(select(ChannelConfig).order_by(ChannelConfig.id.desc())).scalars().first()
        if not channel:
            raise ValueError("ChannelConfig not set. Run `optix channel set` or POST /channel.")
        return channel

    def bootstrap_channel(self, data: ChannelConfigCreate | dict) -> ChannelConfig:
        if isinstance(data, ChannelConfigCreate):
            payload = data.model_dump(exclude_none=True)
        else:
            payload = {key: value for key, value in dict(data).items() if value is not None}
        channel = self.session.execute(select(ChannelConfig).order_by(ChannelConfig.id.desc())).scalars().first()
        if channel:
            for key, value in payload.items():
                setattr(channel, key, value)
            logger.info("Updated ChannelConfig: %s", channel.channel_name)
        else:
            channel = ChannelConfig(**payload)
            self.session.add(channel)
            logger.info("Created ChannelConfig: %s", channel.channel_name)
        self.session.commit()
        return channel

    def refresh_backlog(self, count: int = 30):
        channel = self._get_channel()
        logger.info("Running research for channel: %s", channel.channel_name)
        research_output = research.run(channel, youtube_service=self.youtube)
        logger.info("Generating %s ideas", count)
        ideas = ideation.run(channel, research_output, count=count)

        created = []
        for idea in ideas:
            record = VideoIdea(**idea.model_dump())
            self.session.add(record)
            created.append(record)

        self.session.commit()
        logger.info("Created %s ideas", len(created))
        return created

    def build_video_package(self, top: int = 3):
        channel = self._get_channel()
        ideas = (
            self.session.execute(
                select(VideoIdea)
                .where(VideoIdea.status == "new")
                .order_by(VideoIdea.score_total.desc())
                .limit(top)
            )
            .scalars()
            .all()
        )

        assets = []
        for idea in ideas:
            logger.info("Packaging idea %s", idea.id)
            packaging_output = packaging.run(channel, idea)
            scripting_output = scripting.run(channel, idea, title=packaging_output.titles[0])
            publishing_output = publishing.run(channel, idea, packaging_output, scripting_output)

            asset_payload = VideoAssetCreate(
                idea_id=idea.id,
                titles_json=packaging_output.titles,
                thumbnail_concepts_json=packaging_output.thumbnail_concepts,
                outline_md=scripting_output.outline_md,
                script_md=scripting_output.script_md,
                description_md=publishing_output.description_md,
                chapters_json=publishing_output.chapters,
                endscreen_plan_md=publishing_output.endscreen_plan_md,
                pinned_comment_md=publishing_output.pinned_comment_md,
                shorts_plan_md=publishing_output.shorts_plan_md,
            )

            asset = VideoAsset(**asset_payload.model_dump())
            self.session.add(asset)
            idea.status = "queued"
            assets.append(asset)

        self.session.commit()
        logger.info("Built %s packages", len(assets))
        return assets

    def ingest_metrics(self, days: int = 14):
        channel = self._get_channel()
        logger.info("Ingesting metrics for channel: %s", channel.channel_name)
        ideas = self.session.execute(select(VideoIdea).order_by(VideoIdea.id.desc()).limit(10)).scalars().all()

        snapshots = []
        for idea in ideas:
            seed = idea.id or 1
            impressions = 500 + seed * 120
            ctr = round(0.03 + (seed % 5) * 0.01, 3)
            views = int(impressions * ctr)
            avg_view_duration = 90 + (seed % 4) * 20
            avg_view_percentage = round(0.35 + (seed % 3) * 0.08, 2)
            subs_gained = seed % 7

            snapshot = MetricSnapshot(
                youtube_video_id=None,
                idea_id=idea.id,
                snapshot_date=date.today(),
                impressions=impressions,
                ctr=ctr,
                views=views,
                avg_view_duration=avg_view_duration,
                avg_view_percentage=avg_view_percentage,
                subs_gained=subs_gained,
                notes_json={"source": "stub", "days": days},
            )
            self.session.add(snapshot)
            snapshots.append(snapshot)

        self.session.commit()
        logger.info("Stored %s metric snapshots", len(snapshots))
        return snapshots

    def diagnose(self):
        channel = self._get_channel()
        snapshots = (
            self.session.execute(select(MetricSnapshot).order_by(MetricSnapshot.snapshot_date.desc()).limit(20))
            .scalars()
            .all()
        )
        output = analytics.run(snapshots, channel)

        for diagnosis in output.diagnoses:
            experiment = Experiment(
                name=f"Experiment for idea {diagnosis.idea_id or 'unknown'}",
                hypothesis=diagnosis.reasoning,
                change=diagnosis.experiment,
                start_date=date.today(),
                status="planned",
                outcome_json=None,
            )
            self.session.add(experiment)

        self.session.commit()
        logger.info("Generated %s experiment suggestions", len(output.diagnoses))
        return output

    def weekly_run(self, top: int = 3, count: int = 30):
        backlog = self.refresh_backlog(count=count)
        packages = self.build_video_package(top=top)
        diagnosis = self.diagnose()
        return {
            "backlog": backlog,
            "packages": packages,
            "diagnosis": diagnosis,
        }

    def run(self, goal: str, **kwargs):
        logger.info("Optix routing goal: %s", goal)
        if goal == "bootstrap_channel":
            return self.bootstrap_channel(kwargs.get("data"))
        if goal == "refresh_backlog":
            return self.refresh_backlog(count=kwargs.get("count", 30))
        if goal == "build_video_package":
            return self.build_video_package(top=kwargs.get("top", 3))
        if goal == "ingest_metrics":
            return self.ingest_metrics(days=kwargs.get("days", 14))
        if goal == "diagnose":
            return self.diagnose()
        if goal == "weekly_run":
            return self.weekly_run(top=kwargs.get("top", 3), count=kwargs.get("count", 30))
        raise ValueError(f"Unknown goal: {goal}")
