import { Title } from '@mantine/core';
import { SWRResponse } from 'swr';

import Brackets from '../../components/brackets/brackets';
import { getRounds } from '../../services/adapter';
import TournamentLayout from './_tournament_layout';

export default function TournamentPage({ tournamentData }: any) {
  const swrRoundsResponse: SWRResponse = getRounds(tournamentData.id);

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Title>Tournament {tournamentData.id}</Title>
      <Brackets swrRoundsResponse={swrRoundsResponse} />
    </TournamentLayout>
  );
}

export function getAllTournamentIds() {
  const tournament_ids = [1, 2, 3];
  return tournament_ids.map((id) => ({
    params: {
      id: id.toString(),
    },
  }));
}

export async function getStaticPaths() {
  return {
    paths: getAllTournamentIds(),
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
