import json
from pathlib import Path

from bracket.app import app
from openapi import openapi  # noqa: F401


def test_openapi_up_to_date() -> None:
    schema = app.openapi()
    
    file_path = Path("openapi/openapi.json")
    
    if not file_path.exists():
        pytest.fail(f"OpenAPI file not found at {file_path}")
        
    stored_schema = json.loads(file_path.read_text(encoding="utf-8"))  
    
    assert stored_schema == schema
