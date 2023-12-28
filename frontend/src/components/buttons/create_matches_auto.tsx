import { Button } from '@mantine/core';
import { IconTool } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation();
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
      {t('auto_create_matches_button')}
    </Button>
  );
}
