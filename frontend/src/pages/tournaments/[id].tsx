import { Title } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import Brackets from '../../components/brackets/brackets';
import DeleteButton from '../../components/buttons/delete';
import { getRounds } from '../../services/adapter';
import { deleteRound } from '../../services/round';
import TournamentLayout from './_tournament_layout';

export default function TournamentPage({ tournamentData }: any) {
  const swrRoundsResponse: SWRResponse = getRounds(tournamentData.id);

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Title>Tournament {tournamentData.id}</Title>
      <DeleteButton
        onClick={async () => {
          await deleteRound(tournamentData.id, -1);
          await swrRoundsResponse.mutate(null);
        }}
        title="Delete Round"
      />
      <Brackets tournamentData={tournamentData} swrRoundsResponse={swrRoundsResponse} />
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
