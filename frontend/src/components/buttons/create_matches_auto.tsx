import { Button } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { MdOutlineAutoFixHigh } from 'react-icons/md';
import { SWRResponse } from 'swr';

import { BracketDisplaySettings } from '../../interfaces/brackets';
import { SchedulerSettings } from '../../interfaces/match';
import { Tournament } from '../../interfaces/tournament';
import { createMatchesAuto } from '../../services/round';

export function AutoCreateMatchesButton({
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  stageItemId,
  schedulerSettings,
  displaySettings,
}: {
  schedulerSettings: SchedulerSettings;
  stageItemId: number;
  tournamentData: Tournament;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  displaySettings: BracketDisplaySettings;
}) {
  const { t } = useTranslation();
  return (
    <Button
      size="md"
      color="indigo"
      leftSection={<MdOutlineAutoFixHigh size={24} />}
      disabled={displaySettings.showManualSchedulingOptions === 'true'}
      onClick={async () => {
        await createMatchesAuto(
          tournamentData.id,
          stageItemId,
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
