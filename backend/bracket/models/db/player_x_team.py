from bracket.models.db.shared import BaseModelORM


class PlayerXTeam(BaseModelORM):
    id: int | None = None
    player_id: int
    team_id: int
