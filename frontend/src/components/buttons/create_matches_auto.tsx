import { Button } from '@mantine/core';
import { IconTool } from '@tabler/icons-react';
import React from 'react';
import { SWRResponse } from 'swr';

import { SchedulerSettings } from '../../interfaces/match';
import { Tournament } from '../../interfaces/tournament';
import { createMatchesAuto } from '../../services/round';

export function AutoCreateMatchesButton({
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  roundId,
  schedulerSettings,
}: {
  schedulerSettings: SchedulerSettings;
  roundId: number;
  tournamentData: Tournament;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
}) {
  if (roundId == null) {
    return null;
  }
  return (
    <Button
      size="md"
      mt="1rem"
      mb="1rem"
      color="indigo"
      leftSection={<IconTool size={24} />}
      onClick={async () => {
        await createMatchesAuto(
          tournamentData.id,
          roundId,
          schedulerSettings.eloThreshold,
          schedulerSettings.onlyRecommended,
          schedulerSettings.iterations
        );
        await swrStagesResponse.mutate();
        await swrUpcomingMatchesResponse.mutate();
      }}
    >
      Add new matches automatically
    </Button>
  );
}
