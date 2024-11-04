import { Divider } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { SchedulerSettings } from '../../interfaces/match';
import { RoundInterface } from '../../interfaces/round';
import { StageWithStageItems } from '../../interfaces/stage';
import { Tournament } from '../../interfaces/tournament';
import UpcomingMatchesTable from '../tables/upcoming_matches';
import SwissSettings from './settings/ladder_fixed';

function SchedulingSystem({
  tournamentData,
  draftRound,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
}: {
  tournamentData: Tournament;
  draftRound: RoundInterface;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
}) {
  return (
    <>
      <Divider mt="1rem" mb="2rem" />
      <UpcomingMatchesTable
        round_id={draftRound.id}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
      />
    </>
  );
}

export default function Scheduler({
  activeStage,
  tournamentData,
  draftRound,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  schedulerSettings,
}: {
  activeStage: StageWithStageItems;
  draftRound: RoundInterface;
  tournamentData: Tournament;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  schedulerSettings: SchedulerSettings;
}) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h2>
        Schedule new matches for <u>{draftRound.name}</u> in <u>{activeStage.name}</u>
      </h2>
      <SwissSettings schedulerSettings={schedulerSettings} />
      <SchedulingSystem
        draftRound={draftRound}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
      />
    </div>
  );
}
