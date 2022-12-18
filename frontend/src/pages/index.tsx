import { Title } from '@mantine/core';

import TournamentsTable from '../components/tables/tournaments';
import Layout from './_layout';

export default function HomePage() {
  return (
    <Layout>
      <Title>Tournaments</Title>
      <TournamentsTable />
    </Layout>
  );
}
