import { Button, Center, Grid, Group, Title } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../404';
import Brackets from '../../components/brackets/brackets';
import { NextStageButton } from '../../components/buttons/next_stage_button';
import Scheduler from '../../components/scheduling/scheduling';
import StagesTab from '../../components/utils/stages_tab';
import { getTournamentIdFromRouter, responseIsValid } from '../../components/utils/util';
import { SchedulerSettings } from '../../interfaces/match';
import { RoundInterface } from '../../interfaces/round';
import { StageWithStageItems, getActiveStages } from '../../interfaces/stage';
import { StageItemWithRounds } from '../../interfaces/stage_item';
import { Tournament, getTournamentEndpoint } from '../../interfaces/tournament';
import {
  checkForAuthError,
  getCourts,
  getStages,
  getTournaments,
  getUpcomingMatches,
} from '../../services/adapter';
import TournamentLayout from './_tournament_layout';

export default function TournamentPage() {
  const { id, tournamentData } = getTournamentIdFromRouter();

  const swrTournamentsResponse = getTournaments();
  checkForAuthError(swrTournamentsResponse);
  const swrStagesResponse: SWRResponse = getStages(id);
  const swrCourtsResponse: SWRResponse = getCourts(id);
  const [onlyBehindSchedule, setOnlyBehindSchedule] = useState('true');
  const [eloThreshold, setEloThreshold] = useState(100);
  const [iterations, setIterations] = useState(200);
  const [limit, setLimit] = useState(50);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);

  const schedulerSettings: SchedulerSettings = {
    eloThreshold,
    setEloThreshold,
    onlyBehindSchedule,
    setOnlyBehindSchedule,
    limit,
    setLimit,
    iterations,
    setIterations,
  };

  const tournaments: Tournament[] =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : [];
  const tournamentDataFull = tournaments.filter((tournament) => tournament.id === id)[0];

  const isResponseValid = responseIsValid(swrStagesResponse);
  let activeStage = null;
  let draftRound = null;

  if (isResponseValid) {
    [activeStage] = getActiveStages(swrStagesResponse);

    if (activeStage != null && activeStage.stage_items != null) {
      const draftRounds = activeStage.stage_items.map((stageItem: StageItemWithRounds) => {
        return stageItem.rounds.filter((round: RoundInterface) => round.is_draft);
      });
      if (draftRounds != null && draftRounds.length > 0 && draftRounds[0].length > 0) {
        [[draftRound]] = draftRounds;
      }
    }

    const selectedTab = swrStagesResponse.data.data.filter(
      (stage: StageWithStageItems) => stage.is_active
    );
    if (selectedTab.length > 0 && selectedStageId == null && selectedTab[0].id != null) {
      setSelectedStageId(selectedTab[0].id.toString());
    }
  }

  // TODO: Find a way to not send a request with -1 as round_id here.
  const swrUpcomingMatchesResponse = getUpcomingMatches(
    id,
    draftRound != null ? draftRound.id : -1,
    schedulerSettings
  );

  if (tournamentDataFull == null) {
    return <NotFoundTitle />;
  }

  const scheduler =
    draftRound != null && swrUpcomingMatchesResponse != null ? (
      <>
        <Scheduler
          activeStage={activeStage}
          roundId={draftRound.id}
          tournamentData={tournamentDataFull}
          swrRoundsResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          schedulerSettings={schedulerSettings}
        />
      </>
    ) : null;

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Grid grow>
        <Grid.Col span={6}>
          <Title>{tournamentDataFull.name}</Title>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group position="right">
            <Button
              color="blue"
              size="md"
              variant="outline"
              style={{ marginBottom: 10 }}
              leftIcon={<IconExternalLink size={24} />}
              onClick={() => {
                const endpoint = getTournamentEndpoint(tournamentDataFull);
                window.open(`/tournaments/${endpoint}/dashboard`, '_ blank');
              }}
            >
              View dashboard
            </Button>
            <NextStageButton
              tournamentData={tournamentData}
              swrStagesResponse={swrStagesResponse}
            />
          </Group>
        </Grid.Col>
      </Grid>
      <div style={{ marginTop: '1rem', marginLeft: '1rem', marginRight: '1rem' }}>
        <Center>
          <StagesTab
            swrStagesResponse={swrStagesResponse}
            selectedStageId={selectedStageId}
            setSelectedStageId={setSelectedStageId}
          />
        </Center>
        <Brackets
          tournamentData={tournamentDataFull}
          swrStagesResponse={swrStagesResponse}
          swrCourtsResponse={swrCourtsResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          readOnly={false}
          selectedStageId={selectedStageId}
        />
        {scheduler}
      </div>
    </TournamentLayout>
  );
}
