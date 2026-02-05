from __future__ import annotations

from ..schemas import PublishingOutput


def run(channel, idea, packaging, scripting) -> PublishingOutput:
    promise = channel.channel_promise or "grow faster"
    pillar = idea.pillar or "Growth"

    description_md = f"""In this video, we break down a simple {pillar.lower()} system you can apply immediately.

What you’ll learn:
- The fast win you can test today
- A 3-step framework to diagnose and fix weak spots
- How to validate improvements without guesswork

Subscribe for weekly systems to {promise}.
"""

    chapters = [
        "0:00 Hook + promise",
        "0:20 Fast win",
        "0:40 Framework overview",
        "2:00 Step 1 Diagnose",
        "3:00 Step 2 Apply",
        "5:00 Step 3 Validate",
        "6:30 Recap + CTA",
    ]

    endscreen_plan_md = """- Endscreen Video: Best-performing tutorial in this pillar
- Endscreen Playlist: 'YouTube Growth Systems'"""

    pinned_comment_md = (
        "Which part of the framework will you implement first? "
        "Reply and I’ll share a tailored next step."
    )

    community_post_md = (
        "New video is live: a 3-step framework to tighten your "
        f"{pillar.lower()} this week. What are you working on right now?"
    )

    shorts_plan_md = (
        "Cut 2 Shorts: one with the fast win, one with the biggest mistake to avoid. "
        "Include a CTA to the full video."
    )

    return PublishingOutput(
        description_md=description_md,
        chapters=chapters,
        endscreen_plan_md=endscreen_plan_md,
        pinned_comment_md=pinned_comment_md,
        community_post_md=community_post_md,
        shorts_plan_md=shorts_plan_md,
    )
