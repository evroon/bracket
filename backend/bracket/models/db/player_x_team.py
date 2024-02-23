from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import PlayerId, PlayerXTeamId, TeamId


class PlayerXTeam(BaseModelORM):
    id: PlayerXTeamId | None = None
    player_id: PlayerId
    team_id: TeamId
