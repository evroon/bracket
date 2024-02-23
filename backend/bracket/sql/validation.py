from collections.abc import Awaitable, Callable
from typing import Any, NoReturn, get_args

from fastapi import HTTPException
from pydantic import BaseModel
from starlette import status

from bracket.models.db.util import StageWithStageItems
from bracket.sql.courts import get_all_courts_in_tournament
from bracket.sql.players import get_all_players_in_tournament, get_player_by_id
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.teams import get_team_by_id
from bracket.utils.id_types import (
    CourtId,
    MatchId,
    PlayerId,
    RoundId,
    StageId,
    StageItemId,
    StageItemInputId,
    TeamId,
    TournamentId,
)

CheckCallableT = Callable[[Any, list[StageWithStageItems], TournamentId], Awaitable[bool]]


async def check_stage_belongs_to_tournament(
    stage_id: StageId, stages: list[StageWithStageItems], _: TournamentId
) -> bool:
    return any(stage.id == stage_id for stage in stages)


async def check_team_belongs_to_tournament(
    team_id: TeamId, _: list[StageWithStageItems], tournament_id: TournamentId
) -> bool:
    return await get_team_by_id(team_id, tournament_id) is not None


async def check_stage_item_belongs_to_tournament(
    stage_item_id: StageItemId, stages: list[StageWithStageItems], _: TournamentId
) -> bool:
    return any(
        stage_item.id == stage_item_id for stage in stages for stage_item in stage.stage_items
    )


async def check_stage_item_input_belongs_to_tournament(
    stage_item_input_id: StageItemInputId, stages: list[StageWithStageItems], _: TournamentId
) -> bool:
    return any(
        stage_item_input.id == stage_item_input_id
        for stage in stages
        for stage_item in stage.stage_items
        for stage_item_input in stage_item.inputs
    )


async def check_round_belongs_to_tournament(
    round_id: RoundId, stages: list[StageWithStageItems], _: TournamentId
) -> bool:
    return any(
        round_.id == round_id
        for stage in stages
        for stage_item in stage.stage_items
        for round_ in stage_item.rounds
    )


async def check_match_belongs_to_tournament(
    match_id: MatchId, stages: list[StageWithStageItems], _: TournamentId
) -> bool:
    return any(
        match.id == match_id
        for stage in stages
        for stage_item in stage.stage_items
        for round_ in stage_item.rounds
        for match in round_.matches
    )


async def check_player_belongs_to_tournament(
    player_id: PlayerId, _: list[StageWithStageItems], tournament_id: TournamentId
) -> bool:
    return await get_player_by_id(player_id, tournament_id) is not None


async def check_players_belong_to_tournament(
    player_ids: set[PlayerId], tournament_id: TournamentId
) -> bool:
    return player_ids.issubset(
        player.id for player in await get_all_players_in_tournament(tournament_id)
    )


async def check_court_belongs_to_tournament(
    court_id: CourtId, _: list[StageWithStageItems], tournament_id: TournamentId
) -> bool:
    return any(court_id == court.id for court in await get_all_courts_in_tournament(tournament_id))


def raise_exception(field_type: Any, field_value: Any) -> NoReturn:
    field_name = field_type.__name__ if field_type is not None else "Unknown type"
    msg = f"Could not find {field_name.replace('Id', '')}(s) with ID {field_value}"
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)


async def check_foreign_keys_belong_to_tournament(
    some_body: BaseModel, tournament_id: TournamentId
) -> None:
    """
    Inspects the types of BaseModel attributes, and based on that checks whether that attribute
    is indeed part of the tournament. This prohibits e.g. adding players from another tournament to
    a certain team.
    """
    stages = await get_full_tournament_details(tournament_id)

    check_lookup: dict[type[Any], CheckCallableT] = {
        StageId: check_stage_belongs_to_tournament,
        TeamId: check_team_belongs_to_tournament,
        StageItemId: check_stage_item_belongs_to_tournament,
        StageItemInputId: check_stage_item_input_belongs_to_tournament,
        RoundId: check_round_belongs_to_tournament,
        PlayerId: check_player_belongs_to_tournament,
        MatchId: check_match_belongs_to_tournament,
        CourtId: check_court_belongs_to_tournament,
    }

    for field_key, field_info in some_body.model_fields.items():
        field_value = getattr(some_body, field_key)
        if field_value is None:
            continue

        if isinstance(field_value, BaseModel):
            await check_foreign_keys_belong_to_tournament(field_value, tournament_id)
        elif isinstance(field_value, set):
            if field_info.annotation == set[PlayerId]:
                if not await check_players_belong_to_tournament(field_value, tournament_id):
                    raise_exception(PlayerId, field_value)
            else:
                raise Exception(f"Unknown set type: {field_info.annotation}")
        else:
            possible_types = [field_info.annotation, *get_args(field_info.annotation)]
            for possible_type in possible_types:
                check_callable = check_lookup.get(possible_type)
                if check_callable is not None and not await check_callable(
                    field_value, stages, tournament_id
                ):
                    raise_exception(possible_type, field_value)
