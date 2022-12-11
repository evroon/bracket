import { Title } from '@mantine/core';
import Layout from '../_layout';

export default function HomePage({ tournamentData }: any) {
  return (
    <Layout>
      <Title>Tournament {tournamentData.id}</Title>
    </Layout>
  );
}

export function getAllPostIds() {
  const tournament_ids = [1, 2, 3];
  return tournament_ids.map((id) => ({
    params: {
      id: id.toString(),
    },
  }));
}

export async function getStaticPaths() {
  return {
    paths: getAllPostIds(),
    fallback: false,
  };
}

export async function getStaticProps({ params }: any) {
  const tournamentData = { id: params.id };
  return {
    props: {
      tournamentData,
    },
  };
}
