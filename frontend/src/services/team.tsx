import { awaitRequestAndHandleError, createAxios, handleRequestError } from './adapter';

export async function createTeam(
  tournament_id: number,
  name: string,
  active: boolean,
  player_ids: string[]
) {
  return createAxios().post(`tournaments/${tournament_id}/teams`, {
    name,
    active,
    player_ids,
  });
}

export async function createTeams(tournament_id: number, names: string, active: boolean) {
  return createAxios()
    .post(`tournaments/${tournament_id}/teams_multi`, { names, active })
    .catch((response: any) => handleRequestError(response));
}

export async function deleteTeam(tournament_id: number, team_id: number) {
  await createAxios()
    .delete(`tournaments/${tournament_id}/teams/${team_id}`)
    .catch((response: any) => handleRequestError(response));
}

export async function updateTeam(
  tournament_id: number,
  team_id: number,
  name: string,
  active: boolean,
  player_ids: string[]
) {
  return awaitRequestAndHandleError(async (axios) =>
    axios.put(`tournaments/${tournament_id}/teams/${team_id}`, {
      name,
      active,
      player_ids,
    })
  );
}
