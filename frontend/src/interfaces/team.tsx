import { Player } from './player';

export interface TeamInterface {
  id: number;
  name: string;
  created: string;
  active: boolean;
  players: Player[];
  elo_score: number;
  swiss_score: number;
  wins: number;
  draws: number;
  losses: number;
  logo_path: string;
}
