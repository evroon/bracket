export type TournamentStatus = 'OPEN' | 'ARCHIVED';

export type TournamentFilter = 'ALL' | TournamentStatus;

export interface Tournament {
  id: number;
  name: string;
  created: string;
  start_time: string;
  club_id: number;
  dashboard_public: boolean;
  dashboard_endpoint: string;
  players_can_be_in_multiple_teams: boolean;
  auto_assign_courts: boolean;
  logo_path: string;
  duration_minutes: number;
  margin_minutes: number;
  status: TournamentStatus;
}
export interface TournamentMinimal {
  id: number;
}
