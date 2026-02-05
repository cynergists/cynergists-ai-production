from __future__ import annotations

from typing import Iterable

from ..config import get_settings
from ..schemas import ResearchOutput
from ..services.youtube import YouTubeService


DEFAULT_PILLARS = [
    "Packaging & CTR",
    "Retention & Scripts",
    "Channel Strategy",
]


def _build_topic_clusters(pillars: Iterable[str], target_viewer: str | None) -> list[dict]:
    viewer = target_viewer or "creators"
    clusters = []
    for pillar in pillars:
        clusters.append(
            {
                "cluster": pillar,
                "topics": [
                    f"{pillar} fundamentals for {viewer}",
                    f"{pillar} mistakes {viewer} keep making",
                    f"Simple {pillar.lower()} playbooks",
                ],
            }
        )
    return clusters


def run(channel, youtube_service: YouTubeService | None = None) -> ResearchOutput:
    settings = get_settings()
    youtube_service = youtube_service or YouTubeService(settings.google_api_key)

    pillars = channel.pillars_json or DEFAULT_PILLARS
    topic_clusters = _build_topic_clusters(pillars, channel.target_viewer)

    competitor_notes = (
        "MVP placeholder: review top creators in your niche for upload cadence, "
        "hooks, and thumbnail patterns."
    )
    trend_notes = (
        "MVP placeholder: watch for recurring viewer questions in comments, "
        "subreddits, and search auto-suggest."
    )

    if youtube_service.available:
        keyword = channel.niche or channel.channel_name
        uploads = youtube_service.search_recent_uploads(keyword, max_results=5)
        if uploads:
            lines = [
                "Recent competitor uploads (YouTube search):",
                *[
                    f"- {item['title']} ({item['channel']})"
                    for item in uploads
                ],
            ]
            competitor_notes = "\n".join(lines)
            trend_notes = (
                "Observed recent upload angles; consider adapting the framing "
                "into your pillar-specific ideas."
            )

    return ResearchOutput(
        competitor_notes=competitor_notes,
        trend_notes=trend_notes,
        topic_clusters=topic_clusters,
    )
