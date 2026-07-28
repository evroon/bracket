export type TournamentStatus = 'OPEN' | 'ARCHIVED';

export type TournamentFilter = 'ALL' | TournamentStatus;

export interface TournamentMinimal {
  id: number;
}
