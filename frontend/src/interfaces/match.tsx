import { TeamInterface } from './team';

export interface MatchInterface {
  id: number;
  round_id: number;
  created: string;
  team1_score: number;
  team2_score: number;
  team1: TeamInterface;
  team2: TeamInterface;
}

export interface UpcomingMatchInterface {
  id: number;
  team1: TeamInterface;
  team2: TeamInterface;
}
