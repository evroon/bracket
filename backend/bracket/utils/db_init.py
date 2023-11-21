from typing import TYPE_CHECKING, Any

from heliclockter import datetime_utc

from bracket.config import Environment, config, environment
from bracket.database import database, engine
from bracket.logic.ranking.elo import recalculate_ranking_for_tournament_id
from bracket.logic.scheduling.builder import build_matches_for_stage_item
from bracket.models.db.club import Club
from bracket.models.db.court import Court
from bracket.models.db.match import Match
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
from bracket.models.db.user_x_club import UserXClub
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
from bracket.sql.stage_items import sql_create_stage_item
from bracket.sql.users import get_user
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
from bracket.utils.logging import logger
from bracket.utils.security import pwd_context
from bracket.utils.types import BaseModelT

if TYPE_CHECKING:
    from sqlalchemy import Table


async def create_admin_user() -> int:
    assert config.admin_email
    assert config.admin_password

    admin = User(
        name='Admin',
        email=config.admin_email,
        password_hash=pwd_context.hash(config.admin_password),
        created=datetime_utc.now(),
    )

    user: int = await database.execute(query=users.insert(), values=admin.dict())
    return user


async def init_db_when_empty() -> int | None:
    table_count = await database.fetch_val(
        'SELECT count(*) FROM information_schema.tables WHERE table_schema = \'public\''
    )
    if config.admin_email and config.admin_password:
        if (table_count <= 1 and environment != Environment.CI) or (
            environment is Environment.DEVELOPMENT and await get_user(config.admin_email) is None
        ):
            logger.warning('Empty db detected, creating tables...')
            metadata.create_all(engine)

            logger.warning('Empty db detected, creating admin user...')
            return await create_admin_user()

    return None


async def sql_create_dev_db() -> None:
    # TODO: refactor into smaller functions
    # pylint: disable=too-many-statements
    assert environment is Environment.DEVELOPMENT

    logger.warning('Initializing database with dummy records')
    await database.connect()
    metadata.drop_all(engine)
    metadata.create_all(engine)
    real_user_id = await init_db_when_empty()

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

    async def insert_dummy(obj_to_insert: BaseModelT, update_data: dict[str, Any] = {}) -> int:
        record_id, _ = await insert_generic(
            database,
            obj_to_insert.copy(update=update_data),
            table_lookup[type(obj_to_insert)],
            type(obj_to_insert),
        )
        return record_id

    user_id_1 = await insert_dummy(DUMMY_USER)
    club_id_1 = await insert_dummy(DUMMY_CLUB)

    await insert_dummy(UserXClub(user_id=user_id_1, club_id=club_id_1))

    if real_user_id is not None:
        await insert_dummy(UserXClub(user_id=real_user_id, club_id=club_id_1))

    tournament_id_1 = await insert_dummy(DUMMY_TOURNAMENT, {'club_id': club_id_1})
    stage_id_1 = await insert_dummy(DUMMY_STAGE1, {'tournament_id': tournament_id_1})
    stage_id_2 = await insert_dummy(DUMMY_STAGE2, {'tournament_id': tournament_id_1})

    team_id_1 = await insert_dummy(DUMMY_TEAM1, {'tournament_id': tournament_id_1})
    team_id_2 = await insert_dummy(DUMMY_TEAM2, {'tournament_id': tournament_id_1})
    team_id_3 = await insert_dummy(DUMMY_TEAM3, {'tournament_id': tournament_id_1})
    team_id_4 = await insert_dummy(DUMMY_TEAM4, {'tournament_id': tournament_id_1})
    team_id_5 = await insert_dummy(
        DUMMY_TEAM4, {'name': 'Team 5', 'tournament_id': tournament_id_1}
    )
    team_id_6 = await insert_dummy(
        DUMMY_TEAM4, {'name': 'Team 6', 'tournament_id': tournament_id_1}
    )
    team_id_7 = await insert_dummy(
        DUMMY_TEAM4, {'name': 'Team 7', 'tournament_id': tournament_id_1}
    )
    team_id_8 = await insert_dummy(
        DUMMY_TEAM4, {'name': 'Team 8', 'tournament_id': tournament_id_1}
    )

    player_id_1 = await insert_dummy(DUMMY_PLAYER1, {'tournament_id': tournament_id_1})
    player_id_2 = await insert_dummy(DUMMY_PLAYER2, {'tournament_id': tournament_id_1})
    player_id_3 = await insert_dummy(DUMMY_PLAYER3, {'tournament_id': tournament_id_1})
    player_id_4 = await insert_dummy(DUMMY_PLAYER4, {'tournament_id': tournament_id_1})
    player_id_5 = await insert_dummy(DUMMY_PLAYER5, {'tournament_id': tournament_id_1})
    player_id_6 = await insert_dummy(DUMMY_PLAYER6, {'tournament_id': tournament_id_1})
    player_id_7 = await insert_dummy(DUMMY_PLAYER7, {'tournament_id': tournament_id_1})
    player_id_8 = await insert_dummy(DUMMY_PLAYER8, {'tournament_id': tournament_id_1})

    player_id_9 = await insert_dummy(
        DUMMY_PLAYER8, {'name': 'Player 09', 'tournament_id': tournament_id_1}
    )
    player_id_10 = await insert_dummy(
        DUMMY_PLAYER8, {'name': 'Player 10', 'tournament_id': tournament_id_1}
    )
    player_id_11 = await insert_dummy(
        DUMMY_PLAYER8, {'name': 'Player 11', 'tournament_id': tournament_id_1}
    )
    player_id_12 = await insert_dummy(
        DUMMY_PLAYER8, {'name': 'Player 12', 'tournament_id': tournament_id_1}
    )
    player_id_13 = await insert_dummy(
        DUMMY_PLAYER8, {'name': 'Player 13', 'tournament_id': tournament_id_1}
    )
    player_id_14 = await insert_dummy(
        DUMMY_PLAYER8, {'name': 'Player 14', 'tournament_id': tournament_id_1}
    )
    player_id_15 = await insert_dummy(
        DUMMY_PLAYER8, {'name': 'Player 15', 'tournament_id': tournament_id_1}
    )
    player_id_16 = await insert_dummy(
        DUMMY_PLAYER8, {'name': 'Player 16', 'tournament_id': tournament_id_1}
    )

    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_1, 'team_id': team_id_1})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_2, 'team_id': team_id_1})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_3, 'team_id': team_id_2})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_4, 'team_id': team_id_2})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_5, 'team_id': team_id_3})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_6, 'team_id': team_id_3})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_7, 'team_id': team_id_4})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_8, 'team_id': team_id_4})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_9, 'team_id': team_id_5})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_10, 'team_id': team_id_5})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_11, 'team_id': team_id_6})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_12, 'team_id': team_id_6})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_13, 'team_id': team_id_7})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_14, 'team_id': team_id_7})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_15, 'team_id': team_id_8})
    await insert_dummy(DUMMY_PLAYER_X_TEAM, {'player_id': player_id_16, 'team_id': team_id_8})

    await insert_dummy(DUMMY_COURT1, {'tournament_id': tournament_id_1})
    await insert_dummy(DUMMY_COURT2, {'tournament_id': tournament_id_1})

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

    for tournament in await database.fetch_all(tournaments.select()):
        await recalculate_ranking_for_tournament_id(tournament.id)  # type: ignore[attr-defined]
