import { Divider } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { SchedulerSettings } from '../../interfaces/match';
import { StageWithRounds } from '../../interfaces/stage';
import { Tournament } from '../../interfaces/tournament';
import UpcomingMatchesTable from '../tables/upcoming_matches';
import LadderFixed from './settings/ladder_fixed';
import RoundRobin from './settings/round_robin';
import SchedulingPlaceholder from './settings/placeholder';

function StageSettings({
  activeStage,
  schedulerSettings,
}: {
  activeStage?: StageWithRounds;
  schedulerSettings: SchedulerSettings;
}) {
  if (activeStage == null) {
    return <SchedulingPlaceholder />;
  }
  if (activeStage.type === 'ROUND_ROBIN') {
    return <RoundRobin />;
  }
  return <LadderFixed schedulerSettings={schedulerSettings} />;
}

export default function Scheduler({
  activeStage,
  tournamentData,
  round_id,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  schedulerSettings,
}: {
  activeStage?: StageWithRounds;
  round_id: number;
  tournamentData: Tournament;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  schedulerSettings: SchedulerSettings;
}) {
  return (
    <>
      <h2>Schedule</h2>
      <StageSettings activeStage={activeStage} schedulerSettings={schedulerSettings} />
      <Divider mt={12} />
      <h4>Schedule new matches</h4>
      <UpcomingMatchesTable
        round_id={round_id}
        tournamentData={tournamentData}
        swrRoundsResponse={swrRoundsResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
      />
    </>
  );
}
