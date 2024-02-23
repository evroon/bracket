from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import PlayerId, TeamId


class PlayerXTeam(BaseModelORM):
    id: int | None = None
    player_id: PlayerId
    team_id: TeamId
