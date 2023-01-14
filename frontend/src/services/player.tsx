import { createAxios, handleRequestError } from './adapter';

export async function createPlayer(tournament_id: number, name: string, team_id: string | null) {
  return createAxios()
    .post(`tournaments/${tournament_id}/players`, {
      name,
      team_id,
    })
    .catch((response: any) => handleRequestError(response));
}

export async function deletePlayer(tournament_id: number, player_id: number) {
  return createAxios()
    .delete(`tournaments/${tournament_id}/players/${player_id}`)
    .catch((response: any) => handleRequestError(response));
}

export async function updatePlayer(
  tournament_id: number,
  player_id: number,
  name: string,
  team_id: string | null
) {
  return createAxios()
    .patch(`tournaments/${tournament_id}/players/${player_id}`, {
      name,
      team_id,
    })
    .catch((response: any) => handleRequestError(response));
}
