from __future__ import annotations

from typing import Any

from ..schemas import IdeaScore, VideoIdeaCreate, ResearchOutput

DEFAULT_WEIGHTS = {
    "pain_intensity": 1.2,
    "search_intent": 1.0,
    "trend_leverage": 0.9,
    "click_potential": 1.1,
    "production_complexity": 0.8,
    "channel_fit": 1.3,
}

SEARCH_TREND_OPTIONS = ["search", "trend", "hybrid"]


def compute_score(scores: dict[str, int], weights: dict[str, float]) -> tuple[float, dict[str, Any]]:
    score = IdeaScore(**scores)
    inverted_complexity = 5 - score.production_complexity
    total = (
        score.pain_intensity * weights["pain_intensity"]
        + score.search_intent * weights["search_intent"]
        + score.trend_leverage * weights["trend_leverage"]
        + score.click_potential * weights["click_potential"]
        + inverted_complexity * weights["production_complexity"]
        + score.channel_fit * weights["channel_fit"]
    )
    breakdown = {
        "raw": score.model_dump(),
        "weights": weights,
        "inverted_complexity": inverted_complexity,
        "total": total,
    }
    return total, breakdown


def _score_seed(index: int, pillar: str, pillars: list[str]) -> dict[str, int]:
    base = index + 1
    return {
        "pain_intensity": (base % 5) + 1,
        "search_intent": ((base + 1) % 5) + 1,
        "trend_leverage": ((base + 2) % 5) + 1,
        "click_potential": ((base + 3) % 5) + 1,
        "production_complexity": ((base + 4) % 5) + 1,
        "channel_fit": 5 if pillar == pillars[0] else 4,
    }


def _generate_one_liner(channel, pillar: str, index: int) -> tuple[str, str, str]:
    viewer = channel.target_viewer or "creators"
    promise = channel.channel_promise or "grow faster"
    idea = f"{pillar}: a repeatable system to help {viewer} {promise} (Part {index + 1})."
    problem = f"{viewer} struggle to apply {pillar.lower()} consistently without a clear playbook."
    angle = f"Show a 3-step framework for {pillar.lower()} that reduces guesswork."
    return idea, problem, angle


def generate_ideas(
    channel,
    research: ResearchOutput,
    count: int = 30,
    weights: dict[str, float] | None = None,
) -> list[VideoIdeaCreate]:
    pillars = channel.pillars_json or [
        "Packaging & CTR",
        "Retention & Scripts",
        "Channel Strategy",
    ]
    weights = weights or DEFAULT_WEIGHTS
    candidates: list[VideoIdeaCreate] = []
    for index in range(count):
        pillar = pillars[index % len(pillars)]
        idea_one_liner, viewer_problem, angle = _generate_one_liner(channel, pillar, index)
        raw_scores = _score_seed(index, pillar, pillars)
        total, breakdown = compute_score(raw_scores, weights)

        candidates.append(
            VideoIdeaCreate(
                pillar=pillar,
                idea_one_liner=idea_one_liner,
                viewer_problem=viewer_problem,
                angle=angle,
                search_or_trend=SEARCH_TREND_OPTIONS[index % len(SEARCH_TREND_OPTIONS)],
                complexity=raw_scores["production_complexity"],
                click_potential=raw_scores["click_potential"],
                score_total=round(total, 2),
                score_breakdown_json=breakdown,
                status="new",
            )
        )
    return candidates


def run(
    channel,
    research: ResearchOutput,
    count: int = 30,
    weights: dict[str, float] | None = None,
) -> list[VideoIdeaCreate]:
    return generate_ideas(channel, research, count=count, weights=weights)
