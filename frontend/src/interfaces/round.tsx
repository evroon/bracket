import { MatchInterface } from './match';

export interface Round {
  id: number;
  stage_item_id: number;
  created: string;
  name: string;
  is_draft: boolean;
  matches: MatchInterface[];
}
