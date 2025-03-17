from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import cast

from sqlalchemy import Table

from bracket.database import database
from bracket.models.db.club import Club, ClubInsertable
from bracket.models.db.court import Court, CourtInsertable
from bracket.models.db.match import Match, MatchInsertable
from bracket.models.db.player import Player, PlayerInsertable
from bracket.models.db.player_x_team import PlayerXTeamInsertable
from bracket.models.db.ranking import Ranking, RankingInsertable
from bracket.models.db.round import Round, RoundInsertable
from bracket.models.db.stage import Stage, StageInsertable
from bracket.models.db.stage_item import StageItem, StageItemInsertable
from bracket.models.db.stage_item_inputs import (
    StageItemInputBase,
    StageItemInputEmpty,
    StageItemInputFinal,
    StageItemInputInsertable,
)
from bracket.models.db.team import Team, TeamInsertable
from bracket.models.db.tournament import Tournament, TournamentInsertable
from bracket.models.db.user import UserInDB, UserInsertable
from bracket.models.db.user_x_club import UserXClub, UserXClubInsertable, UserXClubRelation
from bracket.schema import (
    clubs,
    courts,
    matches,
    players,
    players_x_teams,
    rankings,
    rounds,
    stage_item_inputs,
    stage_items,
    stages,
    teams,
    tournaments,
    users,
    users_x_clubs,
)
from bracket.sql.teams import get_teams_by_id
from bracket.utils.db import insert_generic
from bracket.utils.dummy_records import DUMMY_CLUB, DUMMY_RANKING1, DUMMY_TOURNAMENT
from bracket.utils.id_types import TeamId
from bracket.utils.types import BaseModelT
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
async def inserted_user(user: UserInsertable) -> AsyncIterator[UserInDB]:
    async with inserted_generic(user, users, UserInDB) as row_inserted:
        yield cast("UserInDB", row_inserted)


@asynccontextmanager
async def inserted_club(club: ClubInsertable) -> AsyncIterator[Club]:
    async with inserted_generic(club, clubs, Club) as row_inserted:
        yield cast("Club", row_inserted)


@asynccontextmanager
async def inserted_tournament(tournament: TournamentInsertable) -> AsyncIterator[Tournament]:
    async with inserted_generic(tournament, tournaments, Tournament) as row_inserted:
        yield cast("Tournament", row_inserted)


@asynccontextmanager
async def inserted_team(team: TeamInsertable) -> AsyncIterator[Team]:
    async with inserted_generic(team, teams, Team) as row_inserted:
        yield cast("Team", row_inserted)


@asynccontextmanager
async def inserted_court(court: CourtInsertable) -> AsyncIterator[Court]:
    async with inserted_generic(court, courts, Court) as row_inserted:
        yield cast("Court", row_inserted)


@asynccontextmanager
async def inserted_ranking(ranking: RankingInsertable) -> AsyncIterator[Ranking]:
    async with inserted_generic(ranking, rankings, Ranking) as row_inserted:
        yield cast("Ranking", row_inserted)


@asynccontextmanager
async def inserted_player(player: PlayerInsertable) -> AsyncIterator[Player]:
    async with inserted_generic(player, players, Player) as row_inserted:
        yield cast("Player", row_inserted)


@asynccontextmanager
async def inserted_player_in_team(
    player: PlayerInsertable, team_id: TeamId
) -> AsyncIterator[Player]:
    async with inserted_generic(player, players, Player) as row_inserted:
        async with inserted_generic(
            PlayerXTeamInsertable(player_id=cast("Player", row_inserted).id, team_id=team_id),
            players_x_teams,
            PlayerXTeamInsertable,
        ):
            yield cast("Player", row_inserted)


@asynccontextmanager
async def inserted_stage(stage: StageInsertable) -> AsyncIterator[Stage]:
    async with inserted_generic(stage, stages, Stage) as row_inserted:
        yield cast("Stage", row_inserted)


@asynccontextmanager
async def inserted_stage_item(stage_item: StageItemInsertable) -> AsyncIterator[StageItem]:
    async with inserted_generic(stage_item, stage_items, StageItem) as row_inserted:
        yield StageItem(**row_inserted.model_dump())


@asynccontextmanager
async def inserted_stage_item_input(
    stage_item_input: StageItemInputInsertable,
) -> AsyncIterator[StageItemInputFinal | StageItemInputEmpty]:
    async with inserted_generic(
        stage_item_input, stage_item_inputs, StageItemInputBase
    ) as row_inserted:
        if stage_item_input.team_id is not None:
            [team] = await get_teams_by_id(
                {stage_item_input.team_id}, stage_item_input.tournament_id
            )
            yield StageItemInputFinal.model_validate(
                row_inserted.model_dump() | {"team": team, "team_id": team.id}
            )
        else:
            yield StageItemInputEmpty.model_validate(row_inserted.model_dump())


@asynccontextmanager
async def inserted_round(round_: RoundInsertable) -> AsyncIterator[Round]:
    async with inserted_generic(round_, rounds, Round) as row_inserted:
        yield cast("Round", row_inserted)


@asynccontextmanager
async def inserted_match(match: MatchInsertable) -> AsyncIterator[Match]:
    async with inserted_generic(match, matches, Match) as row_inserted:
        yield cast("Match", row_inserted)


@asynccontextmanager
async def inserted_user_x_club(user_x_club: UserXClubInsertable) -> AsyncIterator[UserXClub]:
    async with inserted_generic(user_x_club, users_x_clubs, UserXClub) as row_inserted:
        yield cast("UserXClub", row_inserted)


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
        inserted_ranking(
            DUMMY_RANKING1.model_copy(update={"tournament_id": tournament_inserted.id})
        ) as ranking_inserted,
        inserted_user_x_club(
            UserXClubInsertable(
                user_id=user_inserted.id,
                club_id=club_inserted.id,
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
            ranking=ranking_inserted,
        )
