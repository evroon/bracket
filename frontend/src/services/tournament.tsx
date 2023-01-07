import { createAxios } from './adapter';

export async function createTournament(club_id: number, name: string) {
  return createAxios().post('tournaments', {
    name,
    club_id,
  });
}

export async function deleteTournament(tournament_id: number) {
  return createAxios().delete(`tournaments/${tournament_id}`);
}

export async function updateTournament(
  tournament_id: number,
  name: string,
  dashboard_public: boolean
) {
  return createAxios().patch(`tournaments/${tournament_id}`, {
    name,
    dashboard_public,
  });
}
