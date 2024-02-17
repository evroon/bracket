import { Button } from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { Tournament } from '../../interfaces/tournament';
import { createStage } from '../../services/stage';

export default function CreateStageButton({
  tournament,
  swrStagesResponse,
}: {
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
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
  swrStagesResponse: SWRResponse;
}) {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      color="green"
      size="lg"
      style={{ marginRight: 10, width: '25%' }}
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
