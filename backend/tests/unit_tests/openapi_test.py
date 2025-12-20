import json
from pathlib import Path

from bracket.app import app


def test_openapi_up_to_date() -> None:
    schema = app.openapi()
    assert Path("openapi/openapi.json").read_text() == json.dumps(schema, indent=2, sort_keys=True)
