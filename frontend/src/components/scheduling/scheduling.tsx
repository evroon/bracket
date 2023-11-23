import { Divider, Grid, Group } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { BracketDisplaySettings } from '../../interfaces/brackets';
import { SchedulerSettings } from '../../interfaces/match';
import { StageWithStageItems, getStageItem } from '../../interfaces/stage';
import { stageItemIsHandledAutomatically } from '../../interfaces/stage_item';
import { Tournament } from '../../interfaces/tournament';
import { getRoundsLookup } from '../../services/lookups';
import { AutoCreateMatchesButton } from '../buttons/create_matches_auto';
import UpcomingMatchesTable from '../tables/upcoming_matches';
import SwissSettings from './settings/ladder_fixed';

function StageSettings({ schedulerSettings }: { schedulerSettings: SchedulerSettings }) {
  return <SwissSettings schedulerSettings={schedulerSettings} />;
}

function SchedulingSystem({
  activeStage,
  tournamentData,
  round_id,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  displaySettings,
}: {
  activeStage?: StageWithStageItems;
  round_id: number;
  tournamentData: Tournament;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  displaySettings: BracketDisplaySettings;
}) {
  if (activeStage == null || stageItemIsHandledAutomatically(getStageItem(activeStage))) {
    return null;
  }
  return (
    <>
      <Divider mt="1rem" mb="2rem" />
      <UpcomingMatchesTable
        round_id={round_id}
        tournamentData={tournamentData}
        swrRoundsResponse={swrRoundsResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        displaySettings={displaySettings}
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
  displaySettings,
}: {
  activeStage: StageWithStageItems;
  roundId: number;
  tournamentData: Tournament;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  schedulerSettings: SchedulerSettings;
  displaySettings: BracketDisplaySettings;
}) {
  const draftRound = getRoundsLookup(swrRoundsResponse)[roundId];
  return (
    <div style={{ marginTop: '1rem' }}>
      <h2>
        Schedule new matches for <u>{draftRound.name}</u> in <u>{activeStage.name}</u>
      </h2>
      <Grid>
        <Grid.Col span="auto">
          <StageSettings schedulerSettings={schedulerSettings} />
        </Grid.Col>
        <Grid.Col span="content">
          <Group position="right">
            <AutoCreateMatchesButton
              swrStagesResponse={swrRoundsResponse}
              swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
              tournamentData={tournamentData}
              roundId={roundId}
            />
          </Group>
        </Grid.Col>
      </Grid>
      <SchedulingSystem
        activeStage={activeStage}
        round_id={roundId}
        tournamentData={tournamentData}
        swrRoundsResponse={swrRoundsResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        displaySettings={displaySettings}
      />
    </div>
  );
}
