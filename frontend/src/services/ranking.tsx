import { createAxios, handleRequestError } from './adapter';

export async function createRanking(tournament_id: number) {
  return createAxios()
    .post(`tournaments/${tournament_id}/rankings`, {})
    .catch((response: any) => handleRequestError(response));
}

export async function editRanking(
  tournament_id: number,
  ranking_id: number,
  win_points: number,
  draw_points: number,
  loss_points: number,
  add_score_points: boolean,
  position: number
) {
  return createAxios()
    .put(`tournaments/${tournament_id}/rankings/${ranking_id}`, {
      win_points,
      draw_points,
      loss_points,
      add_score_points,
      position,
    })
    .catch((response: any) => handleRequestError(response));
}

export async function deleteRanking(tournament_id: number, ranking_id: number) {
  return createAxios()
    .delete(`tournaments/${tournament_id}/rankings/${ranking_id}`)
    .catch((response: any) => handleRequestError(response));
}
