import random
from typing import TYPE_CHECKING, Any, TypeVar

from heliclockter import datetime_utc

from bracket.config import Environment, config, environment
from bracket.database import database, engine
from bracket.logic.ranking.elo import recalculate_ranking_for_tournament_id
from bracket.logic.scheduling.builder import build_matches_for_stage_item
from bracket.models.db.account import UserAccountType
from bracket.models.db.club import Club
from bracket.models.db.court import Court
from bracket.models.db.match import Match, MatchBody
from bracket.models.db.player import Player
from bracket.models.db.player_x_team import PlayerXTeam
from bracket.models.db.round import Round
from bracket.models.db.stage import Stage
from bracket.models.db.stage_item import StageItem, StageItemCreateBody
from bracket.models.db.stage_item_inputs import (
    StageItemInputCreateBodyFinal,
    StageItemInputCreateBodyTentative,
)
from bracket.models.db.team import Team
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import User
from bracket.models.db.user_x_club import UserXClub, UserXClubRelation
from bracket.schema import (
    clubs,
    courts,
    matches,
    metadata,
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
from bracket.sql.matches import sql_update_match
from bracket.sql.stage_items import sql_create_stage_item
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.tournaments import sql_get_tournament
from bracket.sql.users import create_user, get_user
from bracket.utils.alembic import alembic_stamp_head
from bracket.utils.db import insert_generic
from bracket.utils.dummy_records import (
    DUMMY_CLUB,
    DUMMY_COURT1,
    DUMMY_COURT2,
    DUMMY_PLAYER1,
    DUMMY_PLAYER2,
    DUMMY_PLAYER3,
    DUMMY_PLAYER4,
    DUMMY_PLAYER5,
    DUMMY_PLAYER6,
    DUMMY_PLAYER7,
    DUMMY_PLAYER8,
    DUMMY_PLAYER_X_TEAM,
    DUMMY_STAGE1,
    DUMMY_STAGE2,
    DUMMY_STAGE_ITEM1,
    DUMMY_STAGE_ITEM2,
    DUMMY_STAGE_ITEM3,
    DUMMY_TEAM1,
    DUMMY_TEAM2,
    DUMMY_TEAM3,
    DUMMY_TEAM4,
    DUMMY_TOURNAMENT,
    DUMMY_USER,
)
from bracket.utils.id_types import (
    ClubId,
    CourtId,
    PlayerId,
    PlayerXTeamId,
    StageId,
    TeamId,
    TournamentId,
    UserId,
)
from bracket.utils.logging import logger
from bracket.utils.security import hash_password
from bracket.utils.types import BaseModelT, assert_some

if TYPE_CHECKING:
    from sqlalchemy import Table

T = TypeVar("T", bound=int)


async def create_admin_user() -> UserId:
    assert config.admin_email
    assert config.admin_password

    user = await create_user(
        User(
            name="Admin",
            email=config.admin_email,
            password_hash=hash_password(config.admin_password),
            created=datetime_utc.now(),
            account_type=UserAccountType.REGULAR,
        )
    )
    return assert_some(user.id)


async def init_db_when_empty() -> UserId | None:
    table_count = await database.fetch_val(
        "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'"
    )
    if config.admin_email and config.admin_password:
        if (table_count <= 1 and environment != Environment.CI) or (
            environment is Environment.DEVELOPMENT and await get_user(config.admin_email) is None
        ):
            logger.warning("Empty db detected, creating tables...")
            metadata.create_all(engine)
            alembic_stamp_head()

            logger.warning("Empty db detected, creating admin user...")
            return await create_admin_user()

    return None


async def sql_create_dev_db() -> UserId:
    # TODO: refactor into smaller functions
    # pylint: disable=too-many-statements
    assert environment is not Environment.PRODUCTION

    logger.warning("Initializing database with dummy records")
    await database.connect()
    metadata.drop_all(engine)
    metadata.create_all(engine)
    real_user_id = await init_db_when_empty()
    alembic_stamp_head()

    table_lookup: dict[type, Table] = {
        User: users,
        Club: clubs,
        Stage: stages,
        Team: teams,
        UserXClub: users_x_clubs,
        PlayerXTeam: players_x_teams,
        Player: players,
        Round: rounds,
        Match: matches,
        Tournament: tournaments,
        Court: courts,
        StageItem: stage_items,
    }

    async def insert_dummy(
        obj_to_insert: BaseModelT, id_type: type[T], update_data: dict[str, Any] = {}
    ) -> T:
        record_id, _ = await insert_generic(
            database,
            obj_to_insert.model_copy(update=update_data),
            table_lookup[type(obj_to_insert)],
            type(obj_to_insert),
        )
        return id_type(record_id)

    user_id_1 = await insert_dummy(DUMMY_USER, UserId)
    club_id_1 = await insert_dummy(DUMMY_CLUB, ClubId)

    await insert_dummy(
        UserXClub(user_id=user_id_1, club_id=club_id_1, relation=UserXClubRelation.OWNER), int
    )

    if real_user_id is not None:
        await insert_dummy(
            UserXClub(user_id=real_user_id, club_id=club_id_1, relation=UserXClubRelation.OWNER),
            int,
        )

    tournament_id_1 = await insert_dummy(DUMMY_TOURNAMENT, TournamentId, {"club_id": club_id_1})
    stage_id_1 = await insert_dummy(DUMMY_STAGE1, StageId, {"tournament_id": tournament_id_1})
    stage_id_2 = await insert_dummy(DUMMY_STAGE2, StageId, {"tournament_id": tournament_id_1})

    team_id_1 = await insert_dummy(DUMMY_TEAM1, TeamId, {"tournament_id": tournament_id_1})
    team_id_2 = await insert_dummy(DUMMY_TEAM2, TeamId, {"tournament_id": tournament_id_1})
    team_id_3 = await insert_dummy(DUMMY_TEAM3, TeamId, {"tournament_id": tournament_id_1})
    team_id_4 = await insert_dummy(DUMMY_TEAM4, TeamId, {"tournament_id": tournament_id_1})
    team_id_5 = await insert_dummy(
        DUMMY_TEAM4, TeamId, {"name": "Team 5", "tournament_id": tournament_id_1}
    )
    team_id_6 = await insert_dummy(
        DUMMY_TEAM4, TeamId, {"name": "Team 6", "tournament_id": tournament_id_1}
    )
    team_id_7 = await insert_dummy(
        DUMMY_TEAM4, TeamId, {"name": "Team 7", "tournament_id": tournament_id_1}
    )
    team_id_8 = await insert_dummy(
        DUMMY_TEAM4, TeamId, {"name": "Team 8", "tournament_id": tournament_id_1}
    )

    player_id_1 = await insert_dummy(DUMMY_PLAYER1, PlayerId, {"tournament_id": tournament_id_1})
    player_id_2 = await insert_dummy(DUMMY_PLAYER2, PlayerId, {"tournament_id": tournament_id_1})
    player_id_3 = await insert_dummy(DUMMY_PLAYER3, PlayerId, {"tournament_id": tournament_id_1})
    player_id_4 = await insert_dummy(DUMMY_PLAYER4, PlayerId, {"tournament_id": tournament_id_1})
    player_id_5 = await insert_dummy(DUMMY_PLAYER5, PlayerId, {"tournament_id": tournament_id_1})
    player_id_6 = await insert_dummy(DUMMY_PLAYER6, PlayerId, {"tournament_id": tournament_id_1})
    player_id_7 = await insert_dummy(DUMMY_PLAYER7, PlayerId, {"tournament_id": tournament_id_1})
    player_id_8 = await insert_dummy(DUMMY_PLAYER8, PlayerId, {"tournament_id": tournament_id_1})

    player_id_9 = await insert_dummy(
        DUMMY_PLAYER8, PlayerId, {"name": "Player 09", "tournament_id": tournament_id_1}
    )
    player_id_10 = await insert_dummy(
        DUMMY_PLAYER8, PlayerId, {"name": "Player 10", "tournament_id": tournament_id_1}
    )
    player_id_11 = await insert_dummy(
        DUMMY_PLAYER8, PlayerId, {"name": "Player 11", "tournament_id": tournament_id_1}
    )
    player_id_12 = await insert_dummy(
        DUMMY_PLAYER8, PlayerId, {"name": "Player 12", "tournament_id": tournament_id_1}
    )
    player_id_13 = await insert_dummy(
        DUMMY_PLAYER8, PlayerId, {"name": "Player 13", "tournament_id": tournament_id_1}
    )
    player_id_14 = await insert_dummy(
        DUMMY_PLAYER8, PlayerId, {"name": "Player 14", "tournament_id": tournament_id_1}
    )
    player_id_15 = await insert_dummy(
        DUMMY_PLAYER8, PlayerId, {"name": "Player 15", "tournament_id": tournament_id_1}
    )
    player_id_16 = await insert_dummy(
        DUMMY_PLAYER8, PlayerId, {"name": "Player 16", "tournament_id": tournament_id_1}
    )

    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_1, "team_id": team_id_1}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_2, "team_id": team_id_1}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_3, "team_id": team_id_2}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_4, "team_id": team_id_2}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_5, "team_id": team_id_3}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_6, "team_id": team_id_3}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_7, "team_id": team_id_4}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_8, "team_id": team_id_4}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_9, "team_id": team_id_5}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_10, "team_id": team_id_5}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_11, "team_id": team_id_6}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_12, "team_id": team_id_6}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_13, "team_id": team_id_7}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_14, "team_id": team_id_7}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_15, "team_id": team_id_8}
    )
    await insert_dummy(
        DUMMY_PLAYER_X_TEAM, PlayerXTeamId, {"player_id": player_id_16, "team_id": team_id_8}
    )

    await insert_dummy(DUMMY_COURT1, CourtId, {"tournament_id": tournament_id_1})
    await insert_dummy(DUMMY_COURT2, CourtId, {"tournament_id": tournament_id_1})

    stage_item_1 = await sql_create_stage_item(
        tournament_id_1,
        StageItemCreateBody(
            stage_id=stage_id_1,
            name=DUMMY_STAGE_ITEM1.name,
            team_count=DUMMY_STAGE_ITEM1.team_count,
            type=DUMMY_STAGE_ITEM1.type,
            inputs=[
                StageItemInputCreateBodyFinal(
                    slot=1,
                    team_id=team_id_1,
                ),
                StageItemInputCreateBodyFinal(
                    slot=2,
                    team_id=team_id_2,
                ),
                StageItemInputCreateBodyFinal(
                    slot=3,
                    team_id=team_id_3,
                ),
                StageItemInputCreateBodyFinal(
                    slot=4,
                    team_id=team_id_4,
                ),
            ],
        ),
    )
    stage_item_2 = await sql_create_stage_item(
        tournament_id_1,
        StageItemCreateBody(
            stage_id=stage_id_1,
            name=DUMMY_STAGE_ITEM2.name,
            team_count=DUMMY_STAGE_ITEM2.team_count,
            type=DUMMY_STAGE_ITEM2.type,
            inputs=[
                StageItemInputCreateBodyFinal(
                    slot=1,
                    team_id=team_id_5,
                ),
                StageItemInputCreateBodyFinal(
                    slot=2,
                    team_id=team_id_6,
                ),
                StageItemInputCreateBodyFinal(
                    slot=3,
                    team_id=team_id_7,
                ),
                StageItemInputCreateBodyFinal(
                    slot=4,
                    team_id=team_id_8,
                ),
            ],
        ),
    )
    stage_item_3 = await sql_create_stage_item(
        tournament_id_1,
        StageItemCreateBody(
            stage_id=stage_id_2,
            name=DUMMY_STAGE_ITEM3.name,
            team_count=DUMMY_STAGE_ITEM3.team_count,
            type=DUMMY_STAGE_ITEM3.type,
            inputs=[
                StageItemInputCreateBodyTentative(
                    slot=1,
                    winner_from_stage_item_id=stage_item_1.id,
                    winner_position=1,
                ),
                StageItemInputCreateBodyTentative(
                    slot=2,
                    winner_from_stage_item_id=stage_item_1.id,
                    winner_position=2,
                ),
                StageItemInputCreateBodyTentative(
                    slot=3,
                    winner_from_stage_item_id=stage_item_2.id,
                    winner_position=1,
                ),
                StageItemInputCreateBodyTentative(
                    slot=4,
                    winner_from_stage_item_id=stage_item_2.id,
                    winner_position=2,
                ),
            ],
        ),
    )

    await build_matches_for_stage_item(stage_item_1, tournament_id_1)
    await build_matches_for_stage_item(stage_item_2, tournament_id_1)
    await build_matches_for_stage_item(stage_item_3, tournament_id_1)

    tournament_details = await sql_get_tournament(tournament_id_1)

    for stage in await get_full_tournament_details(tournament_id_1):
        for stage_item in stage.stage_items:
            for round_ in stage_item.rounds:
                for match in round_.matches:
                    await sql_update_match(
                        match_id=assert_some(match.id),
                        match=MatchBody.model_validate(
                            {
                                **match.model_dump(),
                                "team1_score": random.randint(0, 10),
                                "team2_score": random.randint(0, 10),
                            }
                        ),
                        tournament=tournament_details,
                    )

    for tournament in await database.fetch_all(tournaments.select()):
        await recalculate_ranking_for_tournament_id(tournament.id)  # type: ignore[attr-defined]

    return user_id_1
