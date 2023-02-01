export interface Player {
  id: number;
  name: string;
  active: boolean;
  created: string;
  tournament_id: number;
  elo_score: number;
  swiss_score: number;
  wins: number;
  draws: number;
  losses: number;
}
