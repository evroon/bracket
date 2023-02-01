# from fastapi import HTTPException
#
# from bracket.logic.scheduling.shared import check_team_combination_adheres_to_filter
# from bracket.models.db.match import (
#     MatchFilter,
#     SuggestedMatch,
# )
# from bracket.models.db.player import Player
# from bracket.models.db.round import Round, RoundWithMatches
# from bracket.models.db.team import TeamWithPlayers
# from bracket.utils.sql import (
#     get_rounds_with_matches,
#     get_active_players_in_tournament,
# )
#
#
# def player_already_scheduled(player: Player, draft_round: RoundWithMatches) -> bool:
#     return any((player.id in match.player_ids for match in draft_round.matches))
#
#
# def team_already_scheduled_before(
#     player1: Player, player2: Player, other_rounds: list[RoundWithMatches]
# ) -> bool:
#     return any(
#         (
#             player1 in match.team1.players and player2 in match.team2.players
#             for round_ in other_rounds
#             for match in round_.matches
#         )
#     )
#
#
# async def get_possible_upcoming_matches_for_players(
#     tournament_id: int, filter: MatchFilter
# ) -> list[SuggestedMatch]:
#     suggestions: set[SuggestedMatch] = set()
#     all_rounds = await get_rounds_with_matches(tournament_id)
#     draft_round = next((round_ for round_ in all_rounds if round_.is_draft), None)
#     other_rounds = [round_ for round_ in all_rounds if not round_.is_draft]
#     max_matches_per_round = (
#         max(len(other_round.matches) for other_round in other_rounds)
#         if len(other_rounds) > 0
#         else 10
#     )
#
#     if draft_round is None:
#         raise HTTPException(400, 'There is no draft round, so no matches can be scheduled.')
#
#     players = await get_active_players_in_tournament(tournament_id)
#     players_match_count = {
#         player.id: player.wins + player.draws + player.losses for player in players
#     }
#     max_played_matches = max(players_match_count.values())
#     player_ids_behind_schedule = [
#         player_id
#         for player_id, played in players_match_count.items()
#         if played != max_played_matches
#     ]
#     players_behind_schedule = [
#         player for player in players if player.id in player_ids_behind_schedule
#     ]
#     possible_teams: list[TeamWithPlayers] = []
#
#     for i, player1 in enumerate(players):
#         if player_already_scheduled(player1, draft_round):
#             continue
#
#         for j, player2 in enumerate(players_behind_schedule):
#             if player_already_scheduled(player2, draft_round):
#                 continue
#
#             if team_already_scheduled_before(player1, player2, other_rounds):
#                 continue
#
#             possible_teams.append(TeamWithPlayers(players=[player1, player2]))
#
#     preferred_teams = [
#         team
#         for team in possible_teams
#         if any(player_id in player_ids_behind_schedule for player_id in team.player_ids)
#     ]
#
#     for i, team1 in enumerate(preferred_teams):
#         for j, team2 in enumerate(possible_teams):
#             suggested_match = check_team_combination_adheres_to_filter(team1, team2, filter)
#             if suggested_match:
#                 suggested_match.has_player_behind_schedule = True
#                 suggestions.add(suggested_match)
#
#     if len(suggestions) < filter.limit and not filter.only_behind_schedule:
#         for i, team1 in enumerate(possible_teams):
#             for j, team2 in enumerate(possible_teams[i + 1 :]):
#                 suggested_match = check_team_combination_adheres_to_filter(team1, team2, filter)
#                 if suggested_match and suggested_match not in suggestions:
#                     suggestions.add(suggested_match)
#
#     result = sorted(
#         list(suggestions),
#         key=lambda s: s.elo_diff + (int(1e9) if not s.has_player_behind_schedule else 0),
#     )
#     for i in range(min(max_matches_per_round, len(result))):
#         result[i].is_recommended = True
#
#     return result[: filter.limit]
