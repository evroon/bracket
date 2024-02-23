from enum import auto

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import ClubId, UserId, UserXClubId
from bracket.utils.types import EnumAutoStr


class UserXClubRelation(EnumAutoStr):
    OWNER = auto()
    COLLABORATOR = auto()


class UserXClub(BaseModelORM):
    id: UserXClubId | None = None
    user_id: UserId
    club_id: ClubId
    relation: UserXClubRelation
