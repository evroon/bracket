import { Divider, Grid, Group } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { BracketDisplaySettings } from '../../interfaces/brackets';
import { SchedulerSettings } from '../../interfaces/match';
import { RoundInterface } from '../../interfaces/round';
import { StageWithStageItems } from '../../interfaces/stage';
import { StageItemWithRounds } from '../../interfaces/stage_item';
import { Tournament } from '../../interfaces/tournament';
import { AutoCreateMatchesButton } from '../buttons/create_matches_auto';
import UpcomingMatchesTable from '../tables/upcoming_matches';
import SwissSettings from './settings/ladder_fixed';

function SchedulingSystem({
  tournamentData,
  draftRound,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  displaySettings,
}: {
  tournamentData: Tournament;
  draftRound: RoundInterface;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  displaySettings: BracketDisplaySettings;
}) {
  return (
    <>
      <Divider mt="1rem" mb="2rem" />
      <UpcomingMatchesTable
        round_id={draftRound.id}
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
  stageItem,
  tournamentData,
  draftRound,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  schedulerSettings,
  displaySettings,
}: {
  activeStage: StageWithStageItems;
  stageItem: StageItemWithRounds;
  draftRound: RoundInterface;
  tournamentData: Tournament;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  schedulerSettings: SchedulerSettings;
  displaySettings: BracketDisplaySettings;
}) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h2>
        Schedule new matches for <u>{draftRound.name}</u> in <u>{activeStage.name}</u>
      </h2>
      <Grid>
        <Grid.Col span="auto">
          <SwissSettings schedulerSettings={schedulerSettings} />
        </Grid.Col>
        <Grid.Col span="content">
          <Group justify="right">
            <AutoCreateMatchesButton
              swrStagesResponse={swrRoundsResponse}
              swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
              tournamentData={tournamentData}
              stageItemId={stageItem.id}
              schedulerSettings={schedulerSettings}
            />
          </Group>
        </Grid.Col>
      </Grid>
      <SchedulingSystem
        draftRound={draftRound}
        tournamentData={tournamentData}
        swrRoundsResponse={swrRoundsResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        displaySettings={displaySettings}
      />
    </div>
  );
}
