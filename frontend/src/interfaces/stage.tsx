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
