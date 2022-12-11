import { Title } from '@mantine/core';
import Layout from '../../_layout';
import TournamentsTable from '../../../components/tables/tournaments';

export default function Teams() {
  return (
    <Layout>
      <Title>Teams</Title>
      <TournamentsTable />
    </Layout>
  );
}
