import { RoundInterface } from '../interfaces/round';
import { createAxios, handleRequestError } from './adapter';

export async function createRound(tournament_id: number, stage_item_id: number) {
  return createAxios()
    .post(`tournaments/${tournament_id}/rounds`, {
      stage_item_id,
    })
    .catch((response: any) => handleRequestError(response));
}

export async function createMatchesAuto(tournament_id: number, round_id: number) {
  return createAxios()
    .post(`tournaments/${tournament_id}/rounds/${round_id}/schedule_auto`)
    .catch((response: any) => handleRequestError(response));
}

export async function deleteRound(tournament_id: number, round_id: number) {
  return createAxios()
    .delete(`tournaments/${tournament_id}/rounds/${round_id}`)
    .catch((response: any) => handleRequestError(response));
}

export async function updateRound(tournament_id: number, round_id: number, round: RoundInterface) {
  return createAxios()
    .put(`tournaments/${tournament_id}/rounds/${round_id}`, round)
    .catch((response: any) => handleRequestError(response));
}
