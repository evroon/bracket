export interface Ranking {
  id: number;
  tournament_id: number;
  created: string;
  win_points: number;
  draw_points: number;
  loss_points: number;
  add_score_points: boolean;
  position: number;
}
