import { Button, Center, Grid, Group, Title } from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { IconExternalLink } from '@tabler/icons-react';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../404';
import Brackets from '../../components/brackets/brackets';
import SaveButton from '../../components/buttons/save';
import TournamentModal from '../../components/modals/tournament_modal';
import Scheduler from '../../components/scheduling/scheduler';
import StagesTab from '../../components/utils/stages_tab';
import { getTournamentIdFromRouter, responseIsValid } from '../../components/utils/util';
import { SchedulerSettings } from '../../interfaces/match';
import { StageInterface } from '../../interfaces/round';
import { Tournament } from '../../interfaces/tournament';
import {
  checkForAuthError,
  getStages,
  getTournaments,
  getUpcomingMatches,
} from '../../services/adapter';
import { createRound } from '../../services/round';
import TournamentLayout from './_tournament_layout';

export default function TournamentPage() {
  const { id, tournamentData } = getTournamentIdFromRouter();

  const swrTournamentsResponse = getTournaments();
  checkForAuthError(swrTournamentsResponse);
  const swrStagesResponse: SWRResponse = getStages(id);
  const [onlyBehindSchedule, setOnlyBehindSchedule] = useState('true');
  const [eloThreshold, setEloThreshold] = useState(100);
  const [iterations, setIterations] = useState(200);
  const [limit, setLimit] = useState(50);
  const [activeStageId, setActiveStageId] = useState(null);

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

  const swrUpcomingMatchesResponse: SWRResponse = getUpcomingMatches(id, schedulerSettings);

  const tournaments: Tournament[] =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : [];
  const tournamentDataFull = tournaments.filter((tournament) => tournament.id === id)[0];

  if (tournamentDataFull == null) {
    return <NotFoundTitle />;
  }

  let draft_round = null;
  if (responseIsValid(swrStagesResponse)) {
    draft_round = swrStagesResponse.data.data
      .flat()
      .filter((stage: StageInterface) => stage.is_draft);

    const activeTab = swrStagesResponse.data.data.filter(
      (stage: StageInterface) => stage.is_active
    );
    if (activeTab.length > 0 && activeStageId == null && activeTab[0].id != null) {
      setActiveStageId(activeTab[0].id.toString());
    }
  }

  const scheduler =
    draft_round != null && draft_round.length > 0 ? (
      <>
        <h2>Settings</h2>
        <Scheduler
          round_id={draft_round[0].id}
          tournamentData={tournamentDataFull}
          swrRoundsResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          schedulerSettings={schedulerSettings}
        />
      </>
    ) : (
      ''
    );
  const tournamentModal =
    tournamentData != null ? (
      <TournamentModal
        tournament={tournamentDataFull}
        swrTournamentsResponse={swrTournamentsResponse}
        in_table={false}
      />
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
              style={{ marginBottom: 10 }}
              leftIcon={<IconExternalLink size={24} />}
              onClick={() => {
                window.open(`/tournaments/${tournamentData.id}/dashboard`, '_ blank');
              }}
            >
              View dashboard
            </Button>
            {tournamentModal}
            <SaveButton
              onClick={async () => {
                await createRound(tournamentData.id);
                await swrStagesResponse.mutate();
              }}
              leftIcon={<GoPlus size={24} />}
              title="Add Round"
            />
          </Group>
        </Grid.Col>
      </Grid>
      <div style={{ marginTop: '15px' }}>
        <Center>
          <StagesTab
            swrStagesResponse={swrStagesResponse}
            activeStageId={activeStageId}
            setActiveStageId={setActiveStageId}
          />
        </Center>
        <Brackets
          tournamentData={tournamentDataFull}
          swrStagesResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          readOnly={false}
          activeStageId={activeStageId}
        />
        {scheduler}
      </div>
    </TournamentLayout>
  );
}
