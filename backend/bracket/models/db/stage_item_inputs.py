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


class StageItemInputFinal(StageItemInputBase, StageItemInputGeneric):
    team_id: TeamId
    team: Team


StageItemInput = StageItemInputTentative | StageItemInputFinal


class StageItemInputCreateBodyTentative(BaseModel):
    slot: int
    winner_from_stage_item_id: StageItemId
    winner_position: int = Field(ge=1)


class StageItemInputCreateBodyFinal(BaseModel):
    slot: int
    team_id: TeamId


StageItemInputCreateBody = StageItemInputCreateBodyTentative | StageItemInputCreateBodyFinal


class StageItemInputInsertable(BaseModel):
    slot: int
    team_id: TeamId
    tournament_id: TournamentId
    stage_item_id: StageItemId


class StageItemInputOptionFinal(BaseModel):
    team_id: TeamId


class StageItemInputOptionTentative(BaseModel):
    winner_from_stage_item_id: StageItemId
    winner_position: int
