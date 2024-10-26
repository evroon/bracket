import { createAxios, handleRequestError } from './adapter';

export async function updateStageItemInput(
  tournament_id: number,
  stage_item_id: number,
  stage_item_input_id: number,
  team_id: number | null,
  winner_position: number | null,
  winner_from_stage_item_id: number | null
) {
  return createAxios()
    .put(
      `tournaments/${tournament_id}/stage_items/${stage_item_id}/inputs/${stage_item_input_id}`,
      { team_id, winner_position, winner_from_stage_item_id }
    )
    .catch((response: any) => handleRequestError(response));
}
