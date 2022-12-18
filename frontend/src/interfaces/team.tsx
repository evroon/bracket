import { Player } from './player';

export interface Team {
  id: number;
  name: string;
  created: string;
  active: boolean;
  players: Player[];
}
