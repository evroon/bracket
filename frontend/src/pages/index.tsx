import { Title } from '@mantine/core';

import TournamentsTable from '../components/tables/tournaments';
import { checkForAuthError, getTournaments } from '../services/adapter';
import Layout from './_layout';

export default function HomePage() {
  const tournament = getTournaments();
  checkForAuthError(tournament);

  return (
    <Layout>
      <Title>Tournaments</Title>
      <TournamentsTable />
    </Layout>
  );
}
