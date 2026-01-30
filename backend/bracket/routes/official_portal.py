from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette import status

from bracket.config import config
from bracket.database import database
from bracket.models.db.official import Official
from bracket.sql.officials import get_official_by_access_code
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


@router.get("/official_portal/matches", response_model=PortalMatchesResponse)
async def portal_get_matches(access_code: str) -> PortalMatchesResponse:
    official = await _get_official_or_raise(access_code)

    query = """
        SELECT
            matches.id,
            matches.position_in_schedule,
            matches.start_time,
            matches.stage_item_input1_score,
            matches.stage_item_input2_score,
            c.name as court_name,
            t1.name as team1_name,
            t2.name as team2_name
        FROM matches
        LEFT JOIN courts c ON matches.court_id = c.id
        LEFT JOIN stage_item_inputs sii1 ON matches.stage_item_input1_id = sii1.id
        LEFT JOIN stage_item_inputs sii2 ON matches.stage_item_input2_id = sii2.id
        LEFT JOIN teams t1 ON sii1.team_id = t1.id
        LEFT JOIN teams t2 ON sii2.team_id = t2.id
        WHERE matches.official_id = :official_id
        ORDER BY matches.position_in_schedule NULLS LAST, matches.id
        """
    results = await database.fetch_all(query=query, values={"official_id": official.id})
    matches = []
    for row in results:
        mapping = dict(row._mapping)
        matches.append(
            PortalMatch(
                id=mapping["id"],
                position_in_schedule=mapping["position_in_schedule"],
                start_time=str(mapping["start_time"]) if mapping["start_time"] else None,
                court_name=mapping["court_name"],
                stage_item_input1_score=mapping["stage_item_input1_score"],
                stage_item_input2_score=mapping["stage_item_input2_score"],
                team1_name=mapping["team1_name"],
                team2_name=mapping["team2_name"],
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
    return {"success": True}
