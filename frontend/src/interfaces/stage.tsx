export interface StageInterface {
  id: number;
  tournament_id: number;
  created: string;
  type: string;
  type_name: string;
  status: string;
  is_active: boolean;
  rounds: StageInterface[];
}
