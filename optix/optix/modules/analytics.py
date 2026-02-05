from __future__ import annotations

from collections import Counter

from ..schemas import AnalyticsOutput, VideoDiagnosis

IMPRESSION_LOW = 1000
CTR_LOW = 0.04
AVP_LOW = 0.4
AVP_STRONG = 0.5
SUBS_LOW = 5


def _diagnose_snapshot(snapshot) -> VideoDiagnosis:
    impressions = snapshot.impressions
    ctr = snapshot.ctr
    avp = snapshot.avg_view_percentage
    subs = snapshot.subs_gained

    if impressions is not None and impressions < IMPRESSION_LOW:
        issue = "Topic/targeting problem"
        reasoning = "Low impressions suggest weak topic-market fit or distribution signals."
        experiment = "Test a tighter topic angle tied to a known viewer pain point."
    elif impressions is not None and ctr is not None and impressions >= IMPRESSION_LOW and ctr < CTR_LOW:
        issue = "Packaging problem"
        reasoning = "High impressions with low CTR indicates the title/thumbnail isn’t converting."
        experiment = "A/B test a higher-contrast thumbnail and a curiosity-driven title."
    elif ctr is not None and avp is not None and ctr >= CTR_LOW and avp < AVP_LOW:
        issue = "Intro/content problem"
        reasoning = "People click but leave early; the first 30–60 seconds isn’t delivering."
        experiment = "Rewrite the hook to deliver the promised value in the first 20 seconds."
    elif avp is not None and subs is not None and avp >= AVP_STRONG and subs < SUBS_LOW:
        issue = "Channel promise/CTA problem"
        reasoning = "Viewers stay but don’t subscribe; value isn’t tied to a clear promise."
        experiment = "Add a sharper CTA that reinforces the channel promise mid-video."
    else:
        issue = "Insufficient signal"
        reasoning = "Metrics are incomplete or mixed; collect another snapshot after changes."
        experiment = "Gather another week of data and re-evaluate with updated packaging."

    return VideoDiagnosis(
        youtube_video_id=snapshot.youtube_video_id,
        idea_id=snapshot.idea_id,
        issue=issue,
        reasoning=reasoning,
        experiment=experiment,
    )


def run(snapshots, channel) -> AnalyticsOutput:
    diagnoses = [_diagnose_snapshot(snapshot) for snapshot in snapshots]
    issue_counts = Counter([d.issue for d in diagnoses])
    top_issues = [issue for issue, _ in issue_counts.most_common(3)]
    experiments = [d.experiment for d in diagnoses]

    return AnalyticsOutput(
        diagnoses=diagnoses,
        top_issues=top_issues,
        experiments=experiments,
    )
