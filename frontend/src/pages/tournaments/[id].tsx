import { Button, Grid, Group, Title } from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { IconExternalLink } from '@tabler/icons';
import React from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../404';
import Brackets from '../../components/brackets/brackets';
import SaveButton from '../../components/buttons/save';
import TournamentModal from '../../components/modals/tournament_modal';
import Scheduler from '../../components/scheduling/scheduler';
import { getTournamentIdFromRouter } from '../../components/utils/util';
import { RoundInterface } from '../../interfaces/round';
import { Tournament } from '../../interfaces/tournament';
import {
  checkForAuthError,
  getRounds,
  getTournaments,
  getUpcomingMatches,
} from '../../services/adapter';
import { createRound } from '../../services/round';
import TournamentLayout from './_tournament_layout';

export default function TournamentPage() {
  const { id, tournamentData } = getTournamentIdFromRouter();

  const swrTournamentsResponse = getTournaments();
  checkForAuthError(swrTournamentsResponse);
  const swrRoundsResponse: SWRResponse = getRounds(id);
  const swrUpcomingMatchesResponse: SWRResponse = getUpcomingMatches(id);

  const tournaments: Tournament[] =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : [];
  const tournamentDataFull = tournaments.filter((tournament) => tournament.id === id)[0];

  if (tournamentDataFull == null) {
    return <NotFoundTitle />;
  }

  const draft_round =
    swrRoundsResponse.data != null
      ? swrRoundsResponse.data.data.filter((round: RoundInterface) => round.is_draft)
      : null;

  const scheduler =
    draft_round != null && draft_round.length > 0 ? (
      <>
        <h2>Settings</h2>
        <Scheduler
          round_id={draft_round[0].id}
          tournamentData={tournamentDataFull}
          swrRoundsResponse={swrRoundsResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
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
        <Grid.Col span={8}>
          <Title>{tournamentDataFull.name}</Title>
        </Grid.Col>
        <Grid.Col span={4}>
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
                await swrRoundsResponse.mutate();
              }}
              leftIcon={<GoPlus size={24} />}
              title="Add Round"
            />
          </Group>
        </Grid.Col>
      </Grid>
      <div style={{ marginTop: '15px' }}>
        <Brackets
          tournamentData={tournamentDataFull}
          swrRoundsResponse={swrRoundsResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          readOnly={false}
        />
        {scheduler}
      </div>
    </TournamentLayout>
  );
}
