import { RoundInterface } from './round';
import { StageItemInput } from './stage_item_input';

export interface StageItemWithRounds {
  id: number;
  created: string;
  type: 'SWISS' | 'ROUND_ROBIN' | 'SINGLE_ELIMINATION';
  name: string;
  type_name: string;
  team_count: number;
  is_active: boolean;
  rounds: RoundInterface[];
  inputs: StageItemInput[];
  stage_id: number;
}
