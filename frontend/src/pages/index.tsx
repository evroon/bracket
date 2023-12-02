import { Grid, Title } from '@mantine/core';

import TournamentModal from '../components/modals/tournament_modal';
import TournamentsTable from '../components/tables/tournaments';
import { checkForAuthError, getTournaments } from '../services/adapter';
import Layout from './_layout';

export default function HomePage() {
  const swrTournamentsResponse = getTournaments();
  checkForAuthError(swrTournamentsResponse);

  return (
    <Layout>
      <Grid justify="space-between">
        <Grid.Col span="auto">
          <Title>Tournaments</Title>
        </Grid.Col>
        <Grid.Col span="content">
          <TournamentModal swrTournamentsResponse={swrTournamentsResponse} />
        </Grid.Col>
      </Grid>
      <TournamentsTable swrTournamentsResponse={swrTournamentsResponse} />
    </Layout>
  );
}
