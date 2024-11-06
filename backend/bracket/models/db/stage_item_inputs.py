from decimal import Decimal

from pydantic import BaseModel, Field

from bracket.models.db.shared import BaseModelORM
from bracket.models.db.team import Team
from bracket.utils.id_types import StageItemId, StageItemInputId, TeamId, TournamentId


class StageItemInputBase(BaseModelORM):
    id: StageItemInputId
    slot: int
    tournament_id: TournamentId
    stage_item_id: StageItemId | None = None


class StageItemInputGeneric(BaseModel):
    team_id: TeamId | None = None
    winner_from_stage_item_id: StageItemId | None = None
    winner_position: int | None = None
    points: Decimal = Decimal("0.0")
    wins: int = 0
    draws: int = 0
    losses: int = 0

    @property
    def elo(self) -> Decimal:
        """
        For now, ELO is saved as points.
        """
        return self.points

    def __hash__(self) -> int:
        return (
            self.team_id,
            self.winner_from_stage_item_id,
            self.winner_position,
        ).__hash__()


class StageItemInputTentative(StageItemInputBase, StageItemInputGeneric):
    team_id: None = None
    winner_from_stage_item_id: StageItemId
    winner_position: int = Field(ge=1)

    def get_lookup_key(self) -> tuple[StageItemId, int]:
        return self.winner_from_stage_item_id, self.winner_position


class StageItemInputFinal(StageItemInputBase, StageItemInputGeneric):
    team_id: TeamId
    team: Team


class StageItemInputEmpty(StageItemInputBase, StageItemInputGeneric):
    team_id: None = None
    winner_from_stage_item_id: None = None
    winner_position: None = None


StageItemInput = StageItemInputTentative | StageItemInputFinal | StageItemInputEmpty


class StageItemInputCreateBodyTentative(BaseModel):
    slot: int
    winner_from_stage_item_id: StageItemId
    winner_position: int = Field(ge=1)


class StageItemInputCreateBodyFinal(BaseModel):
    slot: int
    team_id: TeamId


class StageItemInputCreateBodyEmpty(BaseModel):
    slot: int


StageItemInputCreateBody = (
    StageItemInputCreateBodyTentative
    | StageItemInputCreateBodyFinal
    | StageItemInputCreateBodyEmpty
)


class StageItemInputUpdateBodyTentative(BaseModelORM):
    winner_from_stage_item_id: StageItemId
    winner_position: int = Field(ge=1)


class StageItemInputUpdateBodyFinal(BaseModelORM):
    team_id: TeamId


class StageItemInputUpdateBodyEmpty(BaseModelORM):
    team_id: None = None
    winner_from_stage_item_id: None = None
    winner_position: None = None


StageItemInputUpdateBody = (
    StageItemInputUpdateBodyTentative
    | StageItemInputUpdateBodyFinal
    | StageItemInputUpdateBodyEmpty
)


class StageItemInputInsertable(BaseModel):
    slot: int
    team_id: TeamId | None = None
    tournament_id: TournamentId
    stage_item_id: StageItemId


class StageItemInputOptionFinal(BaseModel):
    team_id: TeamId
    already_taken: bool


class StageItemInputOptionTentative(BaseModel):
    winner_from_stage_item_id: StageItemId
    winner_position: int
    already_taken: bool
