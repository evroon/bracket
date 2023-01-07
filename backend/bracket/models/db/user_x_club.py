from bracket.models.db.shared import BaseModelORM


class UserXClub(BaseModelORM):
    id: int | None = None
    user_id: int
    club_id: int
