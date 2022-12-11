import { createAxios } from './adapter';

export function createTeam(tournament_id: number, name: string, active: boolean) {
  return createAxios().post(`tournaments/${tournament_id}/teams`, { name, active });
}

export function deleteTeam(tournament_id: number, team_id: number) {
  return createAxios().delete(`tournaments/${tournament_id}/teams/${team_id}`);
}

export function updateTeam(tournament_id: number, team_id: number, name: string, active: boolean) {
  return createAxios().patch(`tournaments/${tournament_id}/teams/${team_id}`, { name, active });
}
