from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import PlayerId, PlayerXTeamId, TeamId


class PlayerXTeamInsertable(BaseModelORM):
    player_id: PlayerId
    team_id: TeamId


class PlayerXTeamBody(PlayerXTeamInsertable):
    id: PlayerXTeamId
