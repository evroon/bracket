import { Button } from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import {
  StageItemInputOptionsResponse,
  StageRankingResponse,
  StagesWithStageItemsResponse,
  Tournament,
} from '@openapi';
import { createStage } from '@services/stage';

export default function CreateStageButton({
  tournament,
  swrStagesResponse,
  swrAvailableInputsResponse,
  swrRankingsPerStageItemResponse,
}: {
  tournament: Tournament;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrAvailableInputsResponse: SWRResponse<StageItemInputOptionsResponse>;
  swrRankingsPerStageItemResponse: SWRResponse<StageRankingResponse>;
}) {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      color="green"
      size="xs"
      style={{ marginRight: 10 }}
      onClick={async () => {
        await createStage(tournament.id);
        await swrStagesResponse.mutate();
        await swrAvailableInputsResponse.mutate();
        await swrRankingsPerStageItemResponse.mutate();
      }}
      leftSection={<GoPlus size={24} />}
    >
      {t('add_stage_button')}
    </Button>
  );
}

export function CreateStageButtonLarge({
  tournament,
  swrStagesResponse,
}: {
  tournament: Tournament;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
}) {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      color="green"
      size="lg"
      style={{ marginRight: 10 }}
      onClick={async () => {
        await createStage(tournament.id);
        await swrStagesResponse.mutate();
      }}
      leftSection={<GoPlus size={24} />}
    >
      {t('add_stage_button')}
    </Button>
  );
}
