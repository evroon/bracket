import { createAxios } from './adapter';

export async function createRound(tournament_id: number) {
  return createAxios().post(`tournaments/${tournament_id}/rounds`);
}

export async function deleteRound(tournament_id: number, round_id: number) {
  return createAxios().delete(`tournaments/${tournament_id}/rounds/${round_id}`);
}

export async function updateRound(
  tournament_id: number,
  round_id: number,
  is_draft: boolean,
  is_active: boolean
) {
  return createAxios().patch(`tournaments/${tournament_id}/rounds/${round_id}`, {
    is_draft,
    is_active,
  });
}
