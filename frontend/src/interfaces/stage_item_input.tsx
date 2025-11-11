import { assert_not_none } from '../components/utils/assert';
import { TeamInterface } from './team';

export interface StageItemInput {
  id: number;
  slot: number;
  tournament_id: number;
  stage_item_id: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  team_id: number | null;
  team: TeamInterface | null;
  winner_from_stage_item_id: number | null;
  winner_position: number | null;
}

export interface StageItemInputFinal {
  id: number;
  slot: number;
  tournament_id: number;
  stage_item_id: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  team_id: number;
  team: TeamInterface;
  winner_from_stage_item_id: number | null;
  winner_position: number | null;
}

export interface StageItemInputCreateBody {
  slot: number;
  team_id: number | null;
  winner_from_stage_item_id: number | null;
  winner_position: number | null;
}

export interface StageItemInputOption {
  team_id: number | null;
  winner_from_stage_item_id: number | null;
  winner_position: number | null;
  already_taken: boolean;
}

export interface StageItemInputChoice {
  value: string;
  label: string;
  team_id: number | null;
  winner_from_stage_item_id: number | null;
  winner_position: number | null;
  already_taken: boolean;
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

export function formatStageItemInputTentative(
  stage_item_input: StageItemInput | StageItemInputOption,
  stageItemsLookup: any
) {
  return `${getPositionName(assert_not_none(stage_item_input.winner_position))} of ${stageItemsLookup[assert_not_none(stage_item_input.winner_from_stage_item_id)].name}`;
}

export function formatStageItemInput(
  stage_item_input: StageItemInput | null,
  stageItemsLookup: any
) {
  if (stage_item_input == null) return null;
  if (stage_item_input?.team != null) return stage_item_input.team.name;
  if (stage_item_input?.winner_from_stage_item_id != null) {
    assert_not_none(stage_item_input.winner_position);
    return formatStageItemInputTentative(stage_item_input, stageItemsLookup);
  }
  return null;
}
