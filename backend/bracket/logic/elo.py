from collections import defaultdict
from decimal import Decimal

from pydantic import BaseModel

from bracket.database import database
from bracket.models.db.round import RoundWithMatches
from bracket.schema import players
from bracket.utils.sql import get_rounds_with_matches
from bracket.utils.types import assert_some


class PlayerStatistics(BaseModel):
    wins: int = 0
    draws: int = 0
    losses: int = 0
    elo_score: int = 0
    swiss_score: Decimal = Decimal('0.00')


def calculate_elo_per_player(rounds: list[RoundWithMatches]) -> defaultdict[int, PlayerStatistics]:
    player_x_elo: defaultdict[int, PlayerStatistics] = defaultdict(PlayerStatistics)

    for round in rounds:
        if not round.is_draft:
            for match in round.matches:
                for team_index, team in enumerate(match.teams):
                    for player in team.players:
                        team_score = match.team1_score if team_index == 0 else match.team2_score
                        was_draw = match.team1_score == match.team2_score
                        has_won = not was_draw and team_score == max(
                            match.team1_score, match.team2_score
                        )

                        if has_won:
                            player_x_elo[assert_some(player.id)].wins += 1
                            player_x_elo[assert_some(player.id)].swiss_score += Decimal('1.00')
                        elif was_draw:
                            player_x_elo[assert_some(player.id)].draws += 1
                            player_x_elo[assert_some(player.id)].swiss_score += Decimal('0.50')
                        else:
                            player_x_elo[assert_some(player.id)].losses += 1

                        player_x_elo[assert_some(player.id)].elo_score += team_score

    return player_x_elo


async def recalculate_elo_for_tournament_id(tournament_id: int) -> None:
    rounds_response = await get_rounds_with_matches(tournament_id)
    elo_per_player = calculate_elo_per_player(rounds_response.data)

    for player_id, statistics in elo_per_player.items():
        await database.execute(
            query=players.update().where(
                (players.c.id == player_id) & (players.c.tournament_id == tournament_id)
            ),
            values=statistics.dict(),
        )
