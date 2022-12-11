import { Title } from '@mantine/core';
import Layout from './_layout';
import TournamentsTable from '../components/tables/tournaments';

export default function HomePage() {
  return (
    <Layout>
      <Title>Tournaments</Title>
      <TournamentsTable />
    </Layout>
  );
}
