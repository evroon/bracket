export interface StageItemInput {
  id: number;
  slot: number;
  tournament_id: number;
  stage_item_id: number;
  team_id: number | null;
  team_stage_item_id: number | null;
  team_position_in_group: number | null;
}

export interface StageItemInputCreateBody {
  slot: number;
  team_id: number | null;
  team_stage_item_id: number | null;
  team_position_in_group: number | null;
}

export interface StageItemInputOption {
  team_id: number | null;
  team_stage_item_id: number | null;
  team_position_in_group: number | null;
}

export function getPositionName(position: number) {
  // TODO: handle inputs like `21` (21st)
  return (
    {
      1: '1st',
      2: '2nd',
      3: '3rd',
    }[position] || `${position}th`
  );
}
