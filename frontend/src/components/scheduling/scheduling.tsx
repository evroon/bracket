import { Divider } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { SchedulerSettings } from '../../interfaces/match';
import { Round } from '../../interfaces/round';
import { StageWithStageItems } from '../../interfaces/stage';
import { Tournament } from '../../openapi';
import UpcomingMatchesTable from '../tables/upcoming_matches';
import SwissSettings, { getSwissRoundSchedulingProgress } from './settings/ladder_fixed';

export default function Scheduler({
  activeStage,
  tournamentData,
  draftRound,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  swrCourtsResponse,
  schedulerSettings,
}: {
  activeStage: StageWithStageItems;
  draftRound: Round;
  tournamentData: Tournament;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  swrCourtsResponse: SWRResponse;
  schedulerSettings: SchedulerSettings;
}) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h2>
        Schedule new matches for <u>{draftRound.name}</u> in <u>{activeStage.name}</u>
      </h2>
      <SwissSettings
        schedulerSettings={schedulerSettings}
        progress={getSwissRoundSchedulingProgress(draftRound, swrCourtsResponse)}
      />
      <Divider mt="1rem" mb="2rem" />
      <UpcomingMatchesTable
        draftRound={draftRound}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
      />
    </div>
  );
}
