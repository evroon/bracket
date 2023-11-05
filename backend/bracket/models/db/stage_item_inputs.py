from pydantic import BaseModel, Field

from bracket.models.db.shared import BaseModelORM


class StageItemInputBase(BaseModelORM):
    id: int | None
    slot: int
    tournament_id: int
    stage_item_id: int | None


class StageItemInputGeneric(BaseModel):
    team_id: int | None
    winner_from_stage_item_id: int | None
    winner_position: int | None
    winner_from_match_id: int | None

    def __hash__(self) -> int:
        return (
            self.team_id,
            self.winner_from_stage_item_id,
            self.winner_position,
            self.winner_from_match_id,
        ).__hash__()


class StageItemInputTentative(StageItemInputBase, StageItemInputGeneric):
    team_id: None = None
    winner_from_match_id: None = None
    winner_from_stage_item_id: int
    winner_position: int = Field(ge=1)


class StageItemInputFinal(StageItemInputBase, StageItemInputGeneric):
    team_id: int
    winner_from_match_id: None = None
    winner_from_stage_item_id: None = None
    winner_position: None = None


class StageItemInputMatch(StageItemInputBase, StageItemInputGeneric):
    team_id: None = None
    winner_from_match_id: int
    winner_from_stage_item_id: None = None
    winner_position: None = None


StageItemInput = StageItemInputTentative | StageItemInputFinal | StageItemInputMatch


class StageItemInputCreateBodyTentative(BaseModel):
    slot: int
    winner_from_stage_item_id: int
    winner_position: int = Field(ge=1)


class StageItemInputCreateBodyFinal(BaseModel):
    slot: int
    team_id: int


StageItemInputCreateBody = StageItemInputCreateBodyTentative | StageItemInputCreateBodyFinal


class StageItemInputOptionFinal(BaseModel):
    team_id: int


class StageItemInputOptionTentative(BaseModel):
    winner_from_stage_item_id: int
    winner_position: int
