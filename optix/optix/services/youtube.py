from __future__ import annotations

from typing import Any

import logging
import requests

logger = logging.getLogger(__name__)


class YouTubeService:
    def __init__(self, api_key: str | None):
        self.api_key = api_key
        self.available = bool(api_key)

    def search_recent_uploads(self, query: str, max_results: int = 5) -> list[dict[str, Any]]:
        if not self.available:
            return []
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "order": "date",
            "maxResults": max_results,
            "key": self.api_key,
        }
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            items = response.json().get("items", [])
        except requests.RequestException as exc:
            logger.warning("YouTube search failed: %s", exc)
            return []
        results = []
        for item in items:
            snippet = item.get("snippet", {})
            results.append(
                {
                    "title": snippet.get("title"),
                    "channel": snippet.get("channelTitle"),
                    "video_id": item.get("id", {}).get("videoId"),
                    "published_at": snippet.get("publishedAt"),
                }
            )
        return results

    def fetch_basic_stats(self, video_ids: list[str]) -> dict[str, dict[str, Any]]:
        if not self.available or not video_ids:
            return {}
        url = "https://www.googleapis.com/youtube/v3/videos"
        params = {
            "part": "statistics",
            "id": ",".join(video_ids),
            "key": self.api_key,
        }
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            items = response.json().get("items", [])
        except requests.RequestException as exc:
            logger.warning("YouTube stats fetch failed: %s", exc)
            return {}
        stats = {}
        for item in items:
            stats[item["id"]] = item.get("statistics", {})
        return stats
