---
sidebar_position: 5
---
# API

Bracket has a REST API powered by FastAPI. The frontend sends requests to this API to the backend.
The backend then does the actual processing (usually by querying the database).
For normal usage of Bracket, you most likely don't need to use the API.
Only in case you want to manipulate the state of Bracket via scripts/

The API specification is publicly available. FastAPI serves it in two versions,
choose whatever you like best:

- [ReDoc](https://api.bracketapp.nl/redoc)
- [Swagger UI](https://api.bracketapp.nl/docs)
