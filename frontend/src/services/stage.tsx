import { createAxios, handleRequestError } from './adapter';

export async function createStage(tournament_id: number, type: string) {
  return createAxios()
    .post(`tournaments/${tournament_id}/stages`, { type })
    .catch((response: any) => handleRequestError(response));
}

export async function activateNextStage(tournament_id: number) {
  return createAxios()
    .post(`tournaments/${tournament_id}/stages/activate`)
    .catch((response: any) => handleRequestError(response));
}

export async function deleteStage(tournament_id: number, stage_id: number) {
  return createAxios()
    .delete(`tournaments/${tournament_id}/stages/${stage_id}`)
    .catch((response: any) => handleRequestError(response));
}
