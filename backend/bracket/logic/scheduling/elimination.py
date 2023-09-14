from bracket.logic.scheduling.shared import get_suggested_match
from bracket.models.db.match import SuggestedMatch, SuggestedVirtualMatch
from bracket.models.db.team import FullTeamWithPlayers, TeamWithPlayers
from bracket.models.db.util import StageItemWithRounds
from bracket.sql.rounds import get_rounds_for_stage_item
from bracket.sql.teams import get_teams_with_members
from bracket.utils.types import assert_some


def determine_matches_first_round(
    stage_item: StageItemWithRounds, teams_sorted: list[FullTeamWithPlayers]
) -> list[SuggestedMatch | SuggestedVirtualMatch]:
    suggestions: list[SuggestedMatch | SuggestedVirtualMatch] = []

    # for i in range(0, stage.team_count, 2):
    #     match = SuggestedVirtualMatch(
    #         team1_group_id=
    #     )
    #     suggestions.append(get_suggested_match(team1, team2))

    return suggestions


def todo_determine_matches_other_round(
    stage_item: StageItemWithRounds, teams_sorted: list[TeamWithPlayers]
) -> list[SuggestedMatch | SuggestedVirtualMatch]:
    suggestions: list[SuggestedMatch | SuggestedVirtualMatch] = []
    # previous_round = sorted(
    #     [round_ for round_ in rounds if assert_some(round_.id) < round_id],
    #     key=lambda round_: assert_some(round_.id),
    #     reverse=True,*
    # )[0]

    # winners = []
    # for match in previous_round.matches:
    #     winner = match.get_winner()
    #     assert winner is not None
    #     winners.append(winner)
    #
    # assert len(winners) % 2 == 0
    # for i in range(0, len(winners), 2):
    #     team1, team2 = teams_sorted[i + 0], teams_sorted[i + 1]
    #     suggestions.append(get_suggested_match(team1, team2))
    return suggestions


async def build_single_elimination_stage_item(
    tournament_id: int, stage_item: StageItemWithRounds
) -> list[SuggestedMatch | SuggestedVirtualMatch]:
    stage_id = assert_some(stage_item.stage_id)
    suggestions: list[SuggestedMatch | SuggestedVirtualMatch] = []
    rounds = await get_rounds_for_stage_item(tournament_id, stage_id)
    assert len(rounds) > 0

    for j, round_ in enumerate(stage_item.rounds):
        first_round_id = min(assert_some(round_.id) for round_ in rounds)
        first_round = round_.id == first_round_id

        teams = await get_teams_with_members(tournament_id, only_active_teams=True)
        teams_sorted = sorted(teams, key=lambda team: team.elo_score, reverse=True)

        assert stage_item.team_count % 2 == 0
        assert stage_item.team_count % 2 == 0

        if first_round:
            return determine_matches_first_round(stage_item, teams_sorted)

        previous_round = stage_item.rounds[j - 1]

        winners = []
        for match in previous_round.matches:
            winner = match.get_winner()
            assert winner is not None
            winners.append(winner)

        assert len(winners) % 2 == 0
        for i in range(0, len(winners), 2):
            team1, team2 = teams_sorted[i + 0], teams_sorted[i + 1]
            suggestions.append(get_suggested_match(team1, team2))

    return suggestions


def get_number_of_rounds_to_create_single_elimination(team_count: int) -> int:
    if team_count < 1:
        return 0

    assert team_count % 2 == 0

    game_count_lookup = {
        2: 1,
        4: 2,
        8: 3,
        16: 4,
    }
    return game_count_lookup[team_count]
