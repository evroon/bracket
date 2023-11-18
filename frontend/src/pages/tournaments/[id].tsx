import { Button, Center, Grid, Group, SegmentedControl, Title } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../404';
import Brackets from '../../components/brackets/brackets';
import { NextStageButton } from '../../components/buttons/next_stage_button';
import Scheduler from '../../components/scheduling/scheduling';
import StagesTab from '../../components/utils/stages_tab';
import { getTournamentIdFromRouter, responseIsValid } from '../../components/utils/util';
import { BracketDisplaySettings } from '../../interfaces/brackets';
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
  const [onlyRecommended, setOnlyRecommended] = useState('true');
  const [eloThreshold, setEloThreshold] = useState(100);
  const [iterations, setIterations] = useState(200);
  const [limit, setLimit] = useState(50);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [matchVisibility, setMatchVisibility] = useState('all');
  const [teamNamesDisplay, setTeamNamesDisplay] = useState('team-names');
  const displaySettings: BracketDisplaySettings = {
    matchVisibility,
    setMatchVisibility,
    teamNamesDisplay,
    setTeamNamesDisplay,
  };

  const schedulerSettings: SchedulerSettings = {
    eloThreshold,
    setEloThreshold,
    onlyRecommended,
    setOnlyRecommended,
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
      const draftRounds = activeStage.stage_items.map((stageItem: StageItemWithRounds) =>
        stageItem.rounds.filter((round: RoundInterface) => round.is_draft)
      );
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
    draftRound != null &&
    activeStage != null &&
    `${activeStage.id}` === selectedStageId &&
    swrUpcomingMatchesResponse != null ? (
      <>
        <Scheduler
          activeStage={activeStage}
          roundId={draftRound.id}
          tournamentData={tournamentDataFull}
          swrRoundsResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          schedulerSettings={schedulerSettings}
          displaySettings={displaySettings}
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
            <SegmentedControl
              value={matchVisibility}
              onChange={setMatchVisibility}
              data={[
                { label: 'All matches', value: 'all' },
                { label: 'Future matches', value: 'future-only' },
                { label: 'Current matches', value: 'present-only' },
              ]}
            />
            <SegmentedControl
              value={teamNamesDisplay}
              onChange={setTeamNamesDisplay}
              data={[
                { label: 'Team names', value: 'team-names' },
                { label: 'Player names', value: 'player-names' },
              ]}
            />
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
          displaySettings={displaySettings}
        />
        {scheduler}
      </div>
    </TournamentLayout>
  );
}
