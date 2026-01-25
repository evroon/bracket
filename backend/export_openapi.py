import json
from bracket.app import app 
from openapi import openapi  # noqa: F401

openapi_data = app.openapi()

with open("openapi/openapi.json", "w", encoding="utf-8") as f:
    json.dump(openapi_data, f, indent=2, sort_keys=True)

print("✅ openapi.json has been successfully exported!")