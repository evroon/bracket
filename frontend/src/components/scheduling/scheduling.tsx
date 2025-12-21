import { Divider } from '@mantine/core';
import { SWRResponse } from 'swr';

import UpcomingMatchesTable from '@components/tables/upcoming_matches';
import { SchedulerSettings } from '@components/utils/match';
import {
  CourtsResponse,
  RoundWithMatches,
  StageWithStageItems,
  StagesWithStageItemsResponse,
  Tournament,
  UpcomingMatchesResponse,
} from '@openapi';
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
  draftRound: RoundWithMatches;
  tournamentData: Tournament;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse>;
  swrCourtsResponse: SWRResponse<CourtsResponse>;
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
