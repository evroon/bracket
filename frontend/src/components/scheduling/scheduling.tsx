import { Divider } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { SchedulerSettings } from '../../interfaces/match';
import { StageWithStageItems, getStageItem } from '../../interfaces/stage';
import { stageItemIsHandledAutomatically } from '../../interfaces/stage_item';
import { Tournament } from '../../interfaces/tournament';
import { AutoCreateMatchesButton } from '../buttons/create_matches_auto';
import UpcomingMatchesTable from '../tables/upcoming_matches';
import Elimination from './settings/elimination';
import LadderFixed from './settings/ladder_fixed';
import SchedulingPlaceholder from './settings/placeholder';
import RoundRobin from './settings/round_robin';

function StageSettings({
  activeStage,
  schedulerSettings,
}: {
  activeStage?: StageWithStageItems;
  schedulerSettings: SchedulerSettings;
}) {
  if (activeStage == null) {
    return <SchedulingPlaceholder />;
  }
  const stageItem = getStageItem(activeStage);
  if (stageItem.type === 'ROUND_ROBIN') {
    return <RoundRobin />;
  }
  if (stageItem.type === 'SINGLE_ELIMINATION') {
    return <Elimination />;
  }
  return <LadderFixed schedulerSettings={schedulerSettings} />;
}

function SchedulingSystem({
  activeStage,
  tournamentData,
  round_id,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
}: {
  activeStage?: StageWithStageItems;
  round_id: number;
  tournamentData: Tournament;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
}) {
  if (activeStage == null || stageItemIsHandledAutomatically(getStageItem(activeStage))) {
    return null;
  }
  return (
    <>
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

export default function Scheduler({
  activeStage,
  tournamentData,
  roundId,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  schedulerSettings,
}: {
  activeStage?: StageWithStageItems;
  roundId: number;
  tournamentData: Tournament;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  schedulerSettings: SchedulerSettings;
}) {
  return (
    <>
      <h2>Schedule</h2>
      <StageSettings activeStage={activeStage} schedulerSettings={schedulerSettings} />
      <SchedulingSystem
        activeStage={activeStage}
        round_id={roundId}
        tournamentData={tournamentData}
        swrRoundsResponse={swrRoundsResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
      />
      <AutoCreateMatchesButton
        swrStagesResponse={swrRoundsResponse}
        tournamentData={tournamentData}
        roundId={roundId}
      />
    </>
  );
}
