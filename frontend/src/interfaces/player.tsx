export interface Player {
  id: number;
  name: string;
  created: string;
  tournament_id: number;
  team_id: number;
  elo_score: number;
  wins: number;
  draws: number;
  losses: number;
}
