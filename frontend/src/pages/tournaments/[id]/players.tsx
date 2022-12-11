import { Title } from '@mantine/core';
import Layout from '../../_layout';
import PlayersTable from '../../../components/tables/players';

export default function Players() {
  return (
    <Layout>
      <Title>Players</Title>
      <PlayersTable tournament_id={1} />
    </Layout>
  );
}
