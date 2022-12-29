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
      <Grid grow>
        <Grid.Col span={9}>
          <Title>Tournaments</Title>
        </Grid.Col>
        <Grid.Col span={3}>
          <TournamentModal swrTournamentsResponse={swrTournamentsResponse} tournament={null} />
        </Grid.Col>
      </Grid>
      <TournamentsTable swrTournamentsResponse={swrTournamentsResponse} />
    </Layout>
  );
}
