import secrets

from fastapi import APIRouter, Depends, HTTPException
from heliclockter import datetime_utc
from starlette import status

from bracket.config import config
from bracket.database import database
from bracket.models.db.official import Official, OfficialBody, OfficialToInsert
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import UserPublic
from bracket.routes.auth import (
    user_authenticated_for_tournament,
    user_authenticated_or_public_dashboard,
)
from bracket.routes.models import OfficialsResponse, SingleOfficialResponse, SuccessResponse
from bracket.routes.util import disallow_archived_tournament
from bracket.schema import officials
from bracket.sql.officials import get_all_officials_in_tournament, sql_delete_official, update_official
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.db import fetch_one_parsed
from bracket.utils.id_types import OfficialId, TournamentId
from bracket.utils.types import assert_some

router = APIRouter(prefix=config.api_prefix)


@router.get("/tournaments/{tournament_id}/officials", response_model=OfficialsResponse)
async def get_officials(
    tournament_id: TournamentId,
    _: UserPublic = Depends(user_authenticated_or_public_dashboard),
) -> OfficialsResponse:
    return OfficialsResponse(data=await get_all_officials_in_tournament(tournament_id))


@router.post("/tournaments/{tournament_id}/officials", response_model=SingleOfficialResponse)
async def create_official(
    official_body: OfficialBody,
    tournament_id: TournamentId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    __: Tournament = Depends(disallow_archived_tournament),
) -> SingleOfficialResponse:
    access_code = secrets.token_hex(3)

    last_record_id = await database.execute(
        query=officials.insert(),
        values=OfficialToInsert(
            **official_body.model_dump(),
            access_code=access_code,
            created=datetime_utc.now(),
            tournament_id=tournament_id,
        ).model_dump(),
    )
    return SingleOfficialResponse(
        data=assert_some(
            await fetch_one_parsed(
                database,
                Official,
                officials.select().where(
                    (officials.c.id == last_record_id)
                    & (officials.c.tournament_id == tournament_id)
                ),
            )
        )
    )


@router.put(
    "/tournaments/{tournament_id}/officials/{official_id}",
    response_model=SingleOfficialResponse,
)
async def update_official_by_id(
    tournament_id: TournamentId,
    official_id: OfficialId,
    official_body: OfficialBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    __: Tournament = Depends(disallow_archived_tournament),
) -> SingleOfficialResponse:
    await update_official(
        tournament_id=tournament_id,
        official_id=official_id,
        official_body=official_body,
    )
    return SingleOfficialResponse(
        data=assert_some(
            await fetch_one_parsed(
                database,
                Official,
                officials.select().where(
                    (officials.c.id == official_id)
                    & (officials.c.tournament_id == tournament_id)
                ),
            )
        )
    )


@router.delete(
    "/tournaments/{tournament_id}/officials/{official_id}",
    response_model=SuccessResponse,
)
async def delete_official(
    tournament_id: TournamentId,
    official_id: OfficialId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    __: Tournament = Depends(disallow_archived_tournament),
) -> SuccessResponse:
    stages = await get_full_tournament_details(tournament_id, no_draft_rounds=False)
    used_in_matches_count = 0
    for stage in stages:
        for stage_item in stage.stage_items:
            for round_ in stage_item.rounds:
                for match in round_.matches:
                    if match.official_id == official_id:
                        used_in_matches_count += 1

    if used_in_matches_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not delete official since they're assigned to {used_in_matches_count} matches",
        )

    await sql_delete_official(tournament_id, official_id)
    return SuccessResponse()


@router.post(
    "/tournaments/{tournament_id}/officials/auto_assign",
    response_model=SuccessResponse,
)
async def auto_assign_officials(
    tournament_id: TournamentId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    __: Tournament = Depends(disallow_archived_tournament),
) -> SuccessResponse:
    all_officials = await get_all_officials_in_tournament(tournament_id)
    if len(all_officials) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No officials to assign",
        )

    stages = await get_full_tournament_details(tournament_id, no_draft_rounds=False)

    scheduled_matches = []
    for stage in stages:
        for stage_item in stage.stage_items:
            for round_ in stage_item.rounds:
                for match in round_.matches:
                    if match.position_in_schedule is not None:
                        scheduled_matches.append(match)

    scheduled_matches.sort(key=lambda m: m.position_in_schedule or 0)

    for i, match in enumerate(scheduled_matches):
        official = all_officials[i % len(all_officials)]
        query = """
            UPDATE matches
            SET official_id = :official_id
            WHERE matches.id = :match_id
            """
        await database.execute(
            query=query,
            values={"official_id": official.id, "match_id": match.id},
        )

    return SuccessResponse()


@router.post(
    "/tournaments/{tournament_id}/officials/clear_assignments",
    response_model=SuccessResponse,
)
async def clear_official_assignments(
    tournament_id: TournamentId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    __: Tournament = Depends(disallow_archived_tournament),
) -> SuccessResponse:
    query = """
        UPDATE matches
        SET official_id = NULL
        WHERE matches.round_id IN (
            SELECT rounds.id FROM rounds
            JOIN stage_items ON rounds.stage_item_id = stage_items.id
            JOIN stages ON stage_items.stage_id = stages.id
            WHERE stages.tournament_id = :tournament_id
        )
        """
    await database.execute(query=query, values={"tournament_id": tournament_id})
    return SuccessResponse()
