export interface StageInterface {
  id: number;
  tournament_id: number;
  created: string;
  type: string;
  name: string;
  is_active: boolean;
  rounds: StageInterface[];
}
