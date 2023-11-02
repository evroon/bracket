from pydantic import BaseModel, Field

from bracket.models.db.shared import BaseModelORM


class StageItemInputBase(BaseModelORM):
    id: int | None
    slot: int
    tournament_id: int
    stage_item_id: int | None


class StageItemInputTentative(StageItemInputBase):
    team_id: None = None
    team_stage_item_id: int
    team_position_in_group: int = Field(ge=1)


class StageItemInputFinal(StageItemInputBase):
    team_id: int
    team_stage_item_id: None = None
    team_position_in_group: None = None


StageItemInput = StageItemInputTentative | StageItemInputFinal


class StageItemInputCreateBodyTentative(BaseModel):
    slot: int
    team_stage_item_id: int
    team_position_in_group: int = Field(ge=1)


class StageItemInputCreateBodyFinal(BaseModel):
    slot: int
    team_id: int


StageItemInputCreateBody = StageItemInputCreateBodyTentative | StageItemInputCreateBodyFinal


class StageItemInputOptionFinal(BaseModel):
    team_id: int


class StageItemInputOptionTentative(BaseModel):
    team_stage_item_id: int
    team_position_in_group: int
