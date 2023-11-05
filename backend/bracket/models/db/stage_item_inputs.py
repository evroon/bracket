from pydantic import BaseModel, Field

from bracket.models.db.shared import BaseModelORM


class StageItemInputBase(BaseModelORM):
    id: int | None
    slot: int
    tournament_id: int
    stage_item_id: int | None


class StageItemInputTentative(StageItemInputBase):
    team_id: None = None
    winner_from_match_id: None = None
    winner_from_stage_item_id: int
    winner_position_in_stage_item: int = Field(ge=1)


class StageItemInputFinal(StageItemInputBase):
    team_id: int
    winner_from_match_id: None = None
    winner_from_stage_item_id: None = None
    winner_position_in_stage_item: None = None


class StageItemInputMatch(StageItemInputBase):
    team_id: None = None
    winner_from_match_id: int
    winner_from_stage_item_id: None = None
    winner_position_in_stage_item: None = None


StageItemInput = StageItemInputTentative | StageItemInputFinal | StageItemInputMatch


class StageItemInputCreateBodyTentative(BaseModel):
    slot: int
    winner_from_stage_item_id: int
    winner_position_in_stage_item: int = Field(ge=1)


class StageItemInputCreateBodyFinal(BaseModel):
    slot: int
    team_id: int


StageItemInputCreateBody = StageItemInputCreateBodyTentative | StageItemInputCreateBodyFinal


class StageItemInputOptionFinal(BaseModel):
    team_id: int


class StageItemInputOptionTentative(BaseModel):
    winner_from_stage_item_id: int
    winner_position_in_stage_item: int
