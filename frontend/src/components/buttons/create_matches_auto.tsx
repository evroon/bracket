import { Button } from '@mantine/core';
import { IconTool } from '@tabler/icons-react';
import React from 'react';

import { createMatchesAuto } from '../../services/round';

export function AutoCreateMatchesButton({ tournamentData, swrStagesResponse, roundId }: any) {
  if (roundId == null) {
    return null;
  }
  return (
    <Button
      size="md"
      mt="1rem"
      mb="1rem"
      color="indigo"
      leftIcon={<IconTool size={24} />}
      onClick={async () => {
        await createMatchesAuto(tournamentData.id, roundId);
        swrStagesResponse.mutate();
      }}
    >
      Schedule new matches automatically
    </Button>
  );
}
