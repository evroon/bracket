import { SWRResponse } from 'swr';

import { StagesWithStageItemsResponse } from '@openapi';

export function getStageById(
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>,
  stageId: number
) {
  return (swrStagesResponse.data?.data || []).filter((stage) => stage.id === stageId);
}
