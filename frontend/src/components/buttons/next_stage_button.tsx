import { Button } from '@mantine/core';
import { IconSquareArrowLeft, IconSquareArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { activateNextStage } from '../../services/stage';

export function NextStageButton({ tournamentData, swrStagesResponse }: any) {
  const { t } = useTranslation();
  return (
    <Button
      size="md"
      style={{ marginBottom: 10 }}
      color="indigo"
      leftSection={<IconSquareArrowRight size={24} />}
      onClick={async () => {
        await activateNextStage(tournamentData.id, 'next');
        swrStagesResponse.mutate();
      }}
    >
      {t('next_stage_button')}
    </Button>
  );
}

export function PreviousStageButton({ tournamentData, swrStagesResponse }: any) {
  const { t } = useTranslation();

  return (
    <Button
      size="md"
      style={{ marginBottom: 10 }}
      color="indigo"
      leftSection={<IconSquareArrowLeft size={24} />}
      onClick={async () => {
        await activateNextStage(tournamentData.id, 'previous');
        swrStagesResponse.mutate();
      }}
    >
      {t('previous_stage_button')}
    </Button>
  );
}
