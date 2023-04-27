import { RoundInterface } from './round';

export interface StageInterface {
  id: number;
  tournament_id: number;
  created: string;
  name: string;
  is_active: boolean;
  rounds: RoundInterface[];
}
