import assert from 'assert';
import { SWRResponse } from 'swr';

import { StageItemWithRounds } from './stage_item';

export interface StageWithStageItems {
  id: number;
  tournament_id: number;
  created: string;
  name: string;
  is_active: boolean;
  stage_items: StageItemWithRounds[];
}

export function getActiveStages(swrStagesResponse: SWRResponse) {
  return swrStagesResponse.data.data.filter((stage: StageWithStageItems) => stage.is_active);
}

export function getActiveStage(swrStagesResponse: SWRResponse) {
  return getActiveStages(swrStagesResponse)[0];
}

export function getStageItem(stage: StageWithStageItems) {
  assert(stage.stage_items.length === 1);
  return stage.stage_items[0];
}
