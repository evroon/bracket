import { Button } from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
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
  return (
    <Button
      variant="outline"
      color="green"
      size="xs"
      style={{ marginRight: 10 }}
      onClick={async () => {
        await createStage(tournament.id);
        await swrStagesResponse.mutate(null);
      }}
      leftIcon={<GoPlus size={24} />}
    >
      Add stage
    </Button>
  );
}
