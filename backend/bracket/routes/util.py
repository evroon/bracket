from fastapi import HTTPException
from starlette import status

from bracket.database import database
from bracket.models.db.round import Round
from bracket.schema import rounds
from bracket.utils.db import fetch_one_parsed


async def round_dependency(round_id: int) -> Round:
    round = await fetch_one_parsed(database, Round, rounds.select().where(rounds.c.id == round_id))

    if round is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find route with id {round_id}",
        )

    return round
