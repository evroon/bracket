from bracket.models.db.match import MatchFilter, SuggestedMatch
from bracket.models.db.team import TeamWithPlayers


def get_suggested_match(
    team1: TeamWithPlayers, team2: TeamWithPlayers, is_recommended: bool
) -> SuggestedMatch:
    elo_diff = abs(team1.get_elo() - team2.get_elo())
    swiss_diff = abs(team1.get_swiss_score() - team2.get_swiss_score())

    return SuggestedMatch(
        team1=team1,
        team2=team2,
        elo_diff=elo_diff,
        swiss_diff=swiss_diff,
        is_recommended=is_recommended,
        player_behind_schedule_count=0,
    )


def check_team_combination_adheres_to_filter(
    team1: TeamWithPlayers, team2: TeamWithPlayers, filter_: MatchFilter, is_recommended: bool
) -> SuggestedMatch | None:
    if any(player_id in team2.player_ids for player_id in team1.player_ids):
        return None

    suggested_match = get_suggested_match(team1, team2, is_recommended)

    if suggested_match.elo_diff <= filter_.elo_diff_threshold:
        return suggested_match

    return None
