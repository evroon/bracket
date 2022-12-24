from ladderz.models.db.match import UpcomingMatch
from ladderz.models.db.round import Round, RoundWithMatches
from ladderz.utils.types import ELO


def get_possible_upcoming_matches(round: Round) -> list[UpcomingMatch]:
    return []
