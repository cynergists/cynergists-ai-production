from pathlib import Path

from optix import config as config_module
from optix import db as db_module
from optix.orchestrator import Optix
from optix.schemas import ChannelConfigCreate


def test_optix_flow(tmp_path, monkeypatch):
    db_path = tmp_path / "optix.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")

    config_module.reset_settings()
    db_module.reset_engine()
    db_module.init_db()

    Session = db_module.get_session_factory()
    session = Session()
    try:
        optix = Optix(session)
        channel_payload = ChannelConfigCreate(
            channel_name="Test Channel",
            niche="YouTube growth",
            target_viewer="new creators",
            channel_promise="Actionable systems",
            tone_voice="Direct",
            pillars_json=["Packaging", "Retention"],
            constraints_json={"do": ["clarity"], "dont": ["hacks"]},
        )
        optix.bootstrap_channel(channel_payload)

        ideas = optix.refresh_backlog(count=5)
        assert len(ideas) == 5

        assets = optix.build_video_package(top=2)
        assert len(assets) == 2
    finally:
        session.close()
