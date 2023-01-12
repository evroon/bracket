export interface Tournament {
  id: number;
  name: string;
  created: string;
  club_id: number;
  dashboard_public: boolean;
  logo_path: string;
}
export interface TournamentMinimal {
  id: number;
}
