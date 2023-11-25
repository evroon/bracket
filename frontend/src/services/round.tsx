import { RoundInterface } from '../interfaces/round';
import { createAxios, handleRequestError } from './adapter';

export async function createRound(tournament_id: number, stage_item_id: number) {
  return createAxios()
    .post(`tournaments/${tournament_id}/rounds`, {
      stage_item_id,
    })
    .catch((response: any) => handleRequestError(response));
}

export async function createMatchesAuto(
  tournament_id: number,
  round_id: number,
  elo_diff_threshold: number,
  only_recommended: string,
  iterations: number
) {
  return createAxios()
    .post(`tournaments/${tournament_id}/rounds/${round_id}/schedule_auto`, {
      elo_diff_threshold,
      only_recommended,
      iterations,
    })
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

export async function startNextRound(
  tournament_id: number,
  stage_item_id: number,
  adjust_to_time: Date | null
) {
  return createAxios()
    .post(`tournaments/${tournament_id}/stage_items/${stage_item_id}/start_next_round`, {
      adjust_to_time: adjust_to_time != null ? adjust_to_time?.toISOString() : null,
    })
    .catch((response: any) => handleRequestError(response));
}
