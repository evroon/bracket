from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette import status

from bracket.config import config
from bracket.database import database
from bracket.logic.planning.matches import schedule_all_unscheduled_matches
from bracket.logic.ranking.calculation import recalculate_ranking_for_stage_item
from bracket.logic.ranking.elimination import update_inputs_in_subsequent_elimination_rounds
from bracket.models.db.official import Official
from bracket.models.db.stage_item import StageType
from bracket.models.db.stage_item_inputs import StageItemInput, StageItemInputFinal
from bracket.sql.matches import sql_get_match
from bracket.sql.officials import get_official_by_access_code
from bracket.sql.rounds import get_round_by_id
from bracket.sql.stage_items import get_stage_item
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.id_types import MatchId, TournamentId

router = APIRouter(prefix=config.api_prefix)


class PortalLoginBody(BaseModel):
    access_code: str


class PortalLoginResponse(BaseModel):
    official: Official
    tournament_id: TournamentId


class PortalMatch(BaseModel):
    id: MatchId
    position_in_schedule: int | None = None
    start_time: str | None = None
    court_name: str | None = None
    stage_item_input1_score: int
    stage_item_input2_score: int
    team1_name: str | None = None
    team2_name: str | None = None


class PortalMatchesResponse(BaseModel):
    data: list[PortalMatch]


class PortalScoreBody(BaseModel):
    stage_item_input1_score: int
    stage_item_input2_score: int


async def _get_official_or_raise(access_code: str) -> Official:
    official = await get_official_by_access_code(access_code)
    if official is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access code",
        )
    return official


@router.post("/official_portal/login", response_model=PortalLoginResponse)
async def portal_login(body: PortalLoginBody) -> PortalLoginResponse:
    official = await _get_official_or_raise(body.access_code)
    return PortalLoginResponse(official=official, tournament_id=official.tournament_id)


def _resolve_team_name(stage_item_input: StageItemInput | None) -> str | None:
    if stage_item_input is None:
        return None
    if isinstance(stage_item_input, StageItemInputFinal):
        return stage_item_input.team.name
    return None


@router.get("/official_portal/matches", response_model=PortalMatchesResponse)
async def portal_get_matches(access_code: str) -> PortalMatchesResponse:
    official = await _get_official_or_raise(access_code)

    stages = await get_full_tournament_details(official.tournament_id)
    matches = []
    for stage in stages:
        for stage_item in stage.stage_items:
            for round_ in stage_item.rounds:
                for match in round_.matches:
                    if match.official_id != official.id:
                        continue
                    matches.append(
                        PortalMatch(
                            id=match.id,
                            position_in_schedule=match.position_in_schedule,
                            start_time=str(match.start_time) if match.start_time else None,
                            court_name=match.court.name if match.court else None,
                            stage_item_input1_score=match.stage_item_input1_score,
                            stage_item_input2_score=match.stage_item_input2_score,
                            team1_name=_resolve_team_name(match.stage_item_input1),
                            team2_name=_resolve_team_name(match.stage_item_input2),
                        )
                    )

    matches.sort(
        key=lambda m: (
            m.position_in_schedule if m.position_in_schedule is not None else float("inf"),
            m.id,
        )
    )
    return PortalMatchesResponse(data=matches)


@router.put("/official_portal/matches/{match_id}/score")
async def portal_submit_score(
    match_id: MatchId,
    body: PortalScoreBody,
    access_code: str,
) -> dict[str, bool]:
    official = await _get_official_or_raise(access_code)

    check_query = """
        SELECT official_id FROM matches WHERE id = :match_id
        """
    result = await database.fetch_one(query=check_query, values={"match_id": match_id})
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )
    if dict(result._mapping)["official_id"] != official.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This match is not assigned to you",
        )

    update_query = """
        UPDATE matches
        SET stage_item_input1_score = :score1,
            stage_item_input2_score = :score2
        WHERE id = :match_id
        """
    await database.execute(
        query=update_query,
        values={
            "match_id": match_id,
            "score1": body.stage_item_input1_score,
            "score2": body.stage_item_input2_score,
        },
    )

    match = await sql_get_match(match_id)
    round_ = await get_round_by_id(official.tournament_id, match.round_id)
    stage_item = await get_stage_item(official.tournament_id, round_.stage_item_id)
    await recalculate_ranking_for_stage_item(official.tournament_id, stage_item)

    if stage_item.type in (StageType.SINGLE_ELIMINATION, StageType.DOUBLE_ELIMINATION):
        await update_inputs_in_subsequent_elimination_rounds(round_.id, stage_item, {match_id})
        stages = await get_full_tournament_details(official.tournament_id)
        await schedule_all_unscheduled_matches(official.tournament_id, stages)

    return {"success": True}
