from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import cast

from sqlalchemy import Table

from bracket.database import database
from bracket.models.db.club import Club
from bracket.models.db.court import Court
from bracket.models.db.match import Match
from bracket.models.db.player import Player
from bracket.models.db.player_x_team import PlayerXTeam
from bracket.models.db.round import Round
from bracket.models.db.stage import Stage
from bracket.models.db.stage_item import StageItem, StageItemToInsert
from bracket.models.db.team import Team
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import User, UserInDB
from bracket.models.db.user_x_club import UserXClub, UserXClubRelation
from bracket.schema import (
    clubs,
    courts,
    matches,
    players,
    players_x_teams,
    rounds,
    stage_items,
    stages,
    teams,
    tournaments,
    users,
    users_x_clubs,
)
from bracket.utils.db import insert_generic
from bracket.utils.dummy_records import DUMMY_CLUB, DUMMY_TOURNAMENT
from bracket.utils.id_types import TeamId
from bracket.utils.types import BaseModelT, assert_some
from tests.integration_tests.mocks import get_mock_token, get_mock_user
from tests.integration_tests.models import AuthContext


async def assert_row_count_and_clear(table: Table, expected_rows: int) -> None:
    # assert len(await database.fetch_all(query=table.select())) == expected_rows
    await database.execute(query=table.delete())


@asynccontextmanager
async def inserted_generic(
    data_model: BaseModelT, table: Table, return_type: type[BaseModelT]
) -> AsyncIterator[BaseModelT]:
    last_record_id, row_inserted = await insert_generic(database, data_model, table, return_type)

    try:
        yield row_inserted
    finally:
        await database.execute(query=table.delete().where(table.c.id == last_record_id))


@asynccontextmanager
async def inserted_user(user: User) -> AsyncIterator[UserInDB]:
    async with inserted_generic(user, users, UserInDB) as row_inserted:
        yield cast(UserInDB, row_inserted)


@asynccontextmanager
async def inserted_club(club: Club) -> AsyncIterator[Club]:
    async with inserted_generic(club, clubs, Club) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_tournament(tournament: Tournament) -> AsyncIterator[Tournament]:
    async with inserted_generic(tournament, tournaments, Tournament) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_team(team: Team) -> AsyncIterator[Team]:
    async with inserted_generic(team, teams, Team) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_court(court: Court) -> AsyncIterator[Court]:
    async with inserted_generic(court, courts, Court) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_player(player: Player) -> AsyncIterator[Player]:
    async with inserted_generic(player, players, Player) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_player_in_team(player: Player, team_id: TeamId) -> AsyncIterator[Player]:
    async with inserted_generic(player, players, Player) as row_inserted:
        async with inserted_generic(
            PlayerXTeam(player_id=assert_some(row_inserted.id), team_id=team_id),
            players_x_teams,
            PlayerXTeam,
        ):
            yield row_inserted


@asynccontextmanager
async def inserted_stage(stage: Stage) -> AsyncIterator[Stage]:
    async with inserted_generic(stage, stages, Stage) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_stage_item(stage_item: StageItemToInsert) -> AsyncIterator[StageItem]:
    async with inserted_generic(stage_item, stage_items, StageItem) as row_inserted:
        yield StageItem(**row_inserted.model_dump())


@asynccontextmanager
async def inserted_round(round_: Round) -> AsyncIterator[Round]:
    async with inserted_generic(round_, rounds, Round) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_match(match: Match) -> AsyncIterator[Match]:
    async with inserted_generic(match, matches, Match) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_user_x_club(user_x_club: UserXClub) -> AsyncIterator[UserXClub]:
    async with inserted_generic(user_x_club, users_x_clubs, UserXClub) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_auth_context() -> AsyncIterator[AuthContext]:
    mock_user = get_mock_user()
    headers = {"Authorization": f"Bearer {get_mock_token(mock_user)}"}
    async with (
        inserted_user(mock_user) as user_inserted,
        inserted_club(DUMMY_CLUB) as club_inserted,
        inserted_tournament(
            DUMMY_TOURNAMENT.model_copy(update={"club_id": club_inserted.id})
        ) as tournament_inserted,
        inserted_user_x_club(
            UserXClub(
                user_id=user_inserted.id,
                club_id=assert_some(club_inserted.id),
                relation=UserXClubRelation.OWNER,
            )
        ) as user_x_club_inserted,
    ):
        yield AuthContext(
            headers=headers,
            user=user_inserted,
            club=club_inserted,
            tournament=tournament_inserted,
            user_x_club=user_x_club_inserted,
        )
