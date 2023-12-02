import { Button } from '@mantine/core';
import { IconSquareArrowLeft, IconSquareArrowRight } from '@tabler/icons-react';
import React from 'react';

import { activateNextStage } from '../../services/stage';

export function NextStageButton({ tournamentData, swrStagesResponse }: any) {
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
      Go to next stage
    </Button>
  );
}

export function PreviousStageButton({ tournamentData, swrStagesResponse }: any) {
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
      Go to previous stage
    </Button>
  );
}
