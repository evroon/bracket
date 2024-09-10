from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import PlayerId, TeamId


class PlayerXTeamInsertable(BaseModelORM):
    player_id: PlayerId
    team_id: TeamId
