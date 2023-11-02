import { StageItemInputCreateBody } from '../interfaces/stage_item_input';
import { createAxios, handleRequestError } from './adapter';

export async function createStageItem(
  tournament_id: number,
  stage_id: number,
  type: string,
  team_count: number,
  inputs: StageItemInputCreateBody[]
) {
  return createAxios()
    .post(`tournaments/${tournament_id}/stage_items`, { stage_id, type, team_count, inputs })
    .catch((response: any) => handleRequestError(response));
}

export async function updateStageItem(tournament_id: number, stage_item_id: number, name: string) {
  return createAxios()
    .put(`tournaments/${tournament_id}/stage_items/${stage_item_id}`, { name })
    .catch((response: any) => handleRequestError(response));
}

export async function deleteStageItem(tournament_id: number, stage_item_id: number) {
  return createAxios()
    .delete(`tournaments/${tournament_id}/stage_items/${stage_item_id}`)
    .catch((response: any) => handleRequestError(response));
}
