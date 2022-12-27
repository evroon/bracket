from bracket.models.db.match import UpcomingMatch
from bracket.models.db.round import Round, RoundWithMatches
from bracket.utils.types import ELO


def get_possible_upcoming_matches(round: Round) -> list[UpcomingMatch]:
    return []
