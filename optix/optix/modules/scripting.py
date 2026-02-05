from __future__ import annotations

from ..schemas import ScriptingOutput


def run(channel, idea, title: str | None = None, thumbnail: str | None = None) -> ScriptingOutput:
    viewer = channel.target_viewer or "creators"
    promise = channel.channel_promise or "grow faster"
    pillar = idea.pillar or "Growth"

    hook_options = [
        f"In the next 5 minutes, you'll have a {pillar.lower()} system you can run today.",
        f"If you're a {viewer} stuck without results, this 3-step fix is for you.",
        f"I wasted months on {pillar.lower()} mistakes—here's the shortcut I wish I had.",
    ]

    outline_md = """# Outline

1. Cold open hook + promise (0:00–0:20)
2. Fast win: immediate tactic you can copy (0:20–0:40)  
   - Retention reset: pattern break + micro-story
3. Framework overview (0:40–2:00)
4. Step 1: Diagnose the current gap (2:00–3:00)
   - Retention reset: quick example
5. Step 2: Apply the fix (3:00–5:00)
6. Step 3: Validate + iterate (5:00–6:30)
   - Retention reset: checklist reveal
7. Recap + CTA aligned with channel promise (6:30–7:00)
"""

    script_md = f"""# Script (Draft)

**Hook (0:00–0:20)**
{hook_options[0]}

**Deliver value fast (0:20–0:40)**
Here’s the quickest win: pick one {pillar.lower()} lever you can test today and measure a single metric.

**Framework (0:40–2:00)**
We’ll use a 3-step system: diagnose, apply, validate.

**Step 1 — Diagnose (2:00–3:00)**
List your last 5 videos and identify where the drop-off starts.

**Pattern break**
Quick story: I fixed a 30% drop by changing one line in the first 15 seconds.

**Step 2 — Apply (3:00–5:00)**
Choose the highest-impact fix and implement it in your next upload.

**Step 3 — Validate (5:00–6:30)**
Track changes against a baseline for 7 days and keep only what moved the needle.

**Recap + CTA (6:30–7:00)**
If you want more systems to {promise}, subscribe for weekly playbooks.
"""

    pattern_breaks = [
        "Quick visual checklist reveal",
        "On-screen timer for the fast win",
        "Mini case study screenshot",
    ]

    return ScriptingOutput(
        hook_options=hook_options,
        outline_md=outline_md,
        script_md=script_md,
        pattern_breaks=pattern_breaks,
    )
