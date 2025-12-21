import { SWRResponse } from 'swr';

import { StageWithStageItems } from '@openapi';

export function getStageById(swrStagesResponse: SWRResponse, stageId: number) {
  return swrStagesResponse.data.data.filter((stage: StageWithStageItems) => stage.id === stageId);
}
