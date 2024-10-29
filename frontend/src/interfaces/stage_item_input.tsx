import { TeamInterface } from './team';

export interface StageItemInput {
  id: number;
  slot: number;
  tournament_id: number;
  stage_item_id: number;
  team_id: number | null;
  winner_from_stage_item_id: number | null;
  winner_position: number | null;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  team: TeamInterface | null;
}

export interface StageItemInputFinal {
  id: number;
  team: TeamInterface;
  wins: number;
  draws: number;
  losses: number;
  points: number;
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

export function formatStageItemInput(winner_position: number, teamName: string) {
  // @ts-ignore
  return `${getPositionName(winner_position)} of ${teamName}`;
}
