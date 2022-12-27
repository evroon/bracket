import { Grid, Group, Title } from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import React from 'react';
import { SWRResponse } from 'swr';

import Brackets from '../../components/brackets/brackets';
import SaveButton from '../../components/buttons/save';
import { getRounds } from '../../services/adapter';
import { createRound } from '../../services/round';
import TournamentLayout from './_tournament_layout';

export default function TournamentPage({ tournamentData }: any) {
  const swrRoundsResponse: SWRResponse = getRounds(tournamentData.id);

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Grid grow>
        <Grid.Col span={9}>
          <Title>Tournament {tournamentData.id}</Title>
        </Grid.Col>
        <Grid.Col span={3}>
          <Group position="right">
            <SaveButton
              onClick={async () => {
                await createRound(tournamentData.id);
                await swrRoundsResponse.mutate();
              }}
              leftIcon={<GoPlus size={24} />}
              title="Add Round"
            />
          </Group>
        </Grid.Col>
      </Grid>
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
