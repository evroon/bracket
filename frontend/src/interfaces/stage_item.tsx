import { RoundInterface } from './round';
import { StageItemInput } from './stage_item_input';

export interface StageItemWithRounds {
  id: number;
  tournament_id: number;
  created: string;
  type: string;
  name: string;
  type_name: string;
  team_count: number;
  is_active: boolean;
  rounds: RoundInterface[];
  inputs: StageItemInput[];
}

export function stageItemIsHandledAutomatically(activeStage: StageItemWithRounds) {
  return ['ROUND_ROBIN', 'SINGLE_ELIMINATION'].includes(activeStage.type);
}
