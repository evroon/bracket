import { Container, Grid, Group, Title } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import Brackets from '../../../components/brackets/brackets';
import { getTournamentIdFromRouter } from '../../../components/utils/util';
import { getRounds } from '../../../services/adapter';

export default function Dashboard() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrRoundsResponse: SWRResponse = getRounds(tournamentData.id);
  return (
    <Container style={{ minWidth: '1200px' }}>
      <Grid grow>
        <Grid.Col span={9}>
          <Title>Tournament {tournamentData.id}</Title>
        </Grid.Col>
        <Grid.Col span={3}>
          <Group position="right" />
        </Grid.Col>
      </Grid>
      <Brackets
        tournamentData={tournamentData}
        swrRoundsResponse={swrRoundsResponse}
        swrUpcomingMatchesResponse={null}
      />
    </Container>
  );
}
