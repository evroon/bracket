import { MatchInterface } from './match';

export interface RoundInterface {
  id: number;
  tournament_id: number;
  created: string;
  round_index: number;
  is_draft: boolean;
  is_active: boolean;
  matches: MatchInterface[];
}
