import { createAxios } from './adapter';

export async function createTeam(
  tournament_id: number,
  name: string,
  active: boolean,
  player_ids: number[]
) {
  await createAxios().post(`tournaments/${tournament_id}/teams`, {
    name,
    active,
    player_ids,
  });
}

export async function deleteTeam(tournament_id: number, team_id: number) {
  await createAxios().delete(`tournaments/${tournament_id}/teams/${team_id}`);
}

export async function updateTeam(
  tournament_id: number,
  team_id: number,
  name: string,
  active: boolean,
  player_ids: number[]
) {
  await createAxios().patch(`tournaments/${tournament_id}/teams/${team_id}`, {
    name,
    active,
    player_ids,
  });
}
