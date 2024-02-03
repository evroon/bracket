from enum import auto

from bracket.models.db.shared import BaseModelORM
from bracket.utils.types import EnumAutoStr


class UserXClubRelation(EnumAutoStr):
    OWNER = auto()
    COLLABORATOR = auto()


class UserXClub(BaseModelORM):
    id: int | None = None
    user_id: int
    club_id: int
    relation: UserXClubRelation
