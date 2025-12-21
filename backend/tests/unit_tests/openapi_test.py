import json
from pathlib import Path

from bracket.app import app
from openapi import openapi  # noqa: F401


def test_openapi_up_to_date() -> None:
    schema = app.openapi()
    if Path("openapi/openapi.json").read_text() != json.dumps(schema, indent=2, sort_keys=True):
        raise Exception("OpenAPI schema is out of date")
