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

export interface MatchBodyInterface {
  id: number;
  round_id: number;
  team1_score: number;
  team2_score: number;
}

export interface UpcomingMatchInterface {
  team1: TeamInterface;
  team2: TeamInterface;
  elo_diff: number;
}
