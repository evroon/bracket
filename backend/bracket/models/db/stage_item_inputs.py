from pydantic import BaseModel, Field

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import MatchId, StageItemId, StageItemInputId, TeamId, TournamentId


class StageItemInputBase(BaseModelORM):
    id: StageItemInputId | None = None
    slot: int
    tournament_id: TournamentId
    stage_item_id: StageItemId | None = None


class StageItemInputGeneric(BaseModel):
    team_id: TeamId | None = None
    winner_from_stage_item_id: StageItemId | None = None
    winner_position: int | None = None
    winner_from_match_id: MatchId | None = None

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
    winner_from_stage_item_id: StageItemId
    winner_position: int = Field(ge=1)


class StageItemInputFinal(StageItemInputBase, StageItemInputGeneric):
    team_id: TeamId
    winner_from_match_id: None = None
    winner_from_stage_item_id: None = None
    winner_position: None = None


class StageItemInputMatch(StageItemInputBase, StageItemInputGeneric):
    team_id: None = None
    winner_from_match_id: MatchId
    winner_from_stage_item_id: None = None
    winner_position: None = None


StageItemInput = StageItemInputTentative | StageItemInputFinal | StageItemInputMatch


class StageItemInputCreateBodyTentative(BaseModel):
    slot: int
    winner_from_stage_item_id: StageItemId
    winner_position: int = Field(ge=1)


class StageItemInputCreateBodyFinal(BaseModel):
    slot: int
    team_id: TeamId


StageItemInputCreateBody = StageItemInputCreateBodyTentative | StageItemInputCreateBodyFinal


class StageItemInputOptionFinal(BaseModel):
    team_id: TeamId


class StageItemInputOptionTentative(BaseModel):
    winner_from_stage_item_id: StageItemId
    winner_position: int
