import { Title } from '@mantine/core';
import Layout from '../../_layout';
import TournamentsTable from '../../../components/tables/tournaments';

export default function Rounds() {
  return (
    <Layout>
      <Title>Rounds</Title>
      <TournamentsTable />
    </Layout>
  );
}
