from __future__ import annotations

from ..schemas import PackagingOutput


def run(channel, idea) -> PackagingOutput:
    viewer = channel.target_viewer or "creators"
    promise = channel.channel_promise or "grow faster"
    pillar = idea.pillar or "Growth"

    titles = [
        f"How to {promise} with {pillar} (No Guesswork)",
        f"The {pillar} Mistakes Killing Your Momentum",
        f"Stop Doing This If You Want {promise}",
        f"I Tested 3 {pillar} Frameworks — Here’s the Winner",
        f"{pillar} in 10 Minutes: The Only Steps You Need",
        f"Why {viewer} Fail at {pillar} (And the Fix)",
        f"The 5-Part {pillar} Checklist for Consistent Growth",
        f"A Contrarian {pillar} Strategy That Actually Works",
        f"The Fastest Way to Improve {pillar} This Week",
        f"What I’d Do Differently to Nail {pillar} in 2026",
    ]

    thumbnail_concepts = [
        "CTR Up 2x",
        "Stop This",
        "3-Step Fix",
    ]

    rationale = (
        "Titles cover how-to, mistakes, contrarian, list, and curiosity angles. "
        "Thumbnail concepts are short, single-idea contrasts that support the hook."
    )

    return PackagingOutput(
        titles=titles,
        thumbnail_concepts=thumbnail_concepts,
        rationale=rationale,
    )
