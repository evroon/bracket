import { TeamInterface } from './team';

export interface MatchInterface {
  id: number;
  round_id: number;
  created: string;
  team1_score: number;
  team2_score: number;
  team1: TeamInterface;
  team2: TeamInterface;
  court_id: number | null;
}

export interface MatchBodyInterface {
  id: number;
  round_id: number;
  team1_score: number;
  team2_score: number;
  court_id: number | null;
}

export interface UpcomingMatchInterface {
  is_recommended: boolean;
  team1: TeamInterface;
  team2: TeamInterface;
  elo_diff: number;
  swiss_diff: number;
}

export interface MatchCreateBodyInterface {
  round_id: number;
  team1_id: number;
  team2_id: number;
  label: string;
}

export interface SchedulerSettings {
  eloThreshold: number;
  setEloThreshold: any;
  limit: number;
  setLimit: any;
  iterations: number;
  setIterations: any;
  onlyBehindSchedule: string;
  setOnlyBehindSchedule: any;
}
