from __future__ import annotations

import json
from typing import Any

try:
    from openai import OpenAI
except Exception:  # pragma: no cover
    OpenAI = None

from .config import get_settings


def _safe_json_parse(text: str) -> dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            return json.loads(text[start : end + 1])
        raise


def generate(prompt: str, json_schema: dict | None = None) -> str | dict:
    settings = get_settings()

    if not settings.openai_api_key or OpenAI is None:
        if json_schema:
            return {"stub": True, "message": "OPENAI_API_KEY missing or OpenAI SDK unavailable."}
        return "OPENAI_API_KEY missing or OpenAI SDK unavailable."

    client = OpenAI(api_key=settings.openai_api_key)

    system = (
        "You are Optix, a YouTube growth assistant. "
        "Avoid policy-violating hacks; focus on clarity, value, and retention."
    )

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": prompt},
    ]

    if json_schema:
        response = client.chat.completions.create(
            model=settings.llm_model,
            messages=messages,
            temperature=settings.llm_temperature,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or "{}"
        return _safe_json_parse(content)

    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=messages,
        temperature=settings.llm_temperature,
    )
    return response.choices[0].message.content or ""
