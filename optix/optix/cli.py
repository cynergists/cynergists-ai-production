from __future__ import annotations

import json
import logging
from pathlib import Path

import typer

from .config import reset_settings
from .db import get_session_factory, init_db, reset_engine
from .orchestrator import Optix
from .schemas import ChannelConfigCreate

app = typer.Typer(help="Optix CLI")
channel_app = typer.Typer(help="Channel operations")
backlog_app = typer.Typer(help="Backlog operations")
package_app = typer.Typer(help="Packaging operations")
metrics_app = typer.Typer(help="Metrics operations")

logging.basicConfig(level=logging.INFO)

app.add_typer(channel_app, name="channel")
app.add_typer(backlog_app, name="backlog")
app.add_typer(package_app, name="package")
app.add_typer(metrics_app, name="metrics")


def _session():
    Session = get_session_factory()
    return Session()


@app.command()
def init():
    """Initialize the database and seed a sample Channel Bible."""
    reset_settings()
    reset_engine()
    init_db()

    seed_path = Path(__file__).resolve().parent / "data" / "seed_channel_bible.json"
    with seed_path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    session = _session()
    try:
        optix = Optix(session)
        optix.bootstrap_channel(ChannelConfigCreate(**payload))
        typer.echo("Initialized Optix database and seeded Channel Bible.")
    finally:
        session.close()


@channel_app.command("set")
def channel_set(
    name: str = typer.Option(..., "--name"),
    niche: str = typer.Option("", "--niche"),
    target_viewer: str = typer.Option("", "--target-viewer"),
    promise: str = typer.Option("", "--promise"),
    tone_voice: str = typer.Option("", "--tone-voice"),
    pillars: str = typer.Option("", "--pillars", help="Comma-separated list"),
    constraints: str = typer.Option("", "--constraints", help="JSON string"),
):
    """Create or update ChannelConfig."""
    payload = {
        "channel_name": name,
        "niche": niche or None,
        "target_viewer": target_viewer or None,
        "channel_promise": promise or None,
        "tone_voice": tone_voice or None,
        "pillars_json": [p.strip() for p in pillars.split(",") if p.strip()] or None,
        "constraints_json": json.loads(constraints) if constraints else None,
    }

    session = _session()
    try:
        optix = Optix(session)
        optix.bootstrap_channel(ChannelConfigCreate(**payload))
        typer.echo("ChannelConfig saved.")
    finally:
        session.close()


@backlog_app.command("refresh")
def backlog_refresh(count: int = typer.Option(30, "--count")):
    """Run research + ideation and save ideas."""
    session = _session()
    try:
        optix = Optix(session)
        ideas = optix.refresh_backlog(count=count)
        typer.echo(f"Created {len(ideas)} ideas.")
    finally:
        session.close()


@package_app.command("build")
def package_build(top: int = typer.Option(3, "--top")):
    """Create packages for the top ideas."""
    session = _session()
    try:
        optix = Optix(session)
        assets = optix.build_video_package(top=top)
        typer.echo(f"Built {len(assets)} packages.")
    finally:
        session.close()


@metrics_app.command("ingest")
def metrics_ingest(days: int = typer.Option(14, "--days")):
    """Pull video metrics (stub if no API key)."""
    session = _session()
    try:
        optix = Optix(session)
        snapshots = optix.ingest_metrics(days=days)
        typer.echo(f"Stored {len(snapshots)} metric snapshots.")
    finally:
        session.close()


@app.command()
def diagnose():
    """Run analytics diagnostics and print next actions."""
    session = _session()
    try:
        optix = Optix(session)
        output = optix.diagnose()
        typer.echo("Top issues:")
        for issue in output.top_issues:
            typer.echo(f"- {issue}")
        typer.echo("Experiments:")
        for experiment in output.experiments:
            typer.echo(f"- {experiment}")
    finally:
        session.close()


@app.command()
def weekly(
    top: int = typer.Option(3, "--top"),
    count: int = typer.Option(30, "--count"),
):
    """Run weekly cadence: refresh -> package -> diagnose."""
    session = _session()
    try:
        optix = Optix(session)
        optix.weekly_run(top=top, count=count)
        typer.echo("Weekly run complete.")
    finally:
        session.close()
