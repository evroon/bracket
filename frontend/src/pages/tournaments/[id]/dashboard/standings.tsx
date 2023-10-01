import { Grid, Image, Skeleton, Title } from '@mantine/core';
import Head from 'next/head';
import React from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../404';
import StandingsTable from '../../../../components/tables/standings';
import { Tournament } from '../../../../interfaces/tournament';
import { getBaseApiUrl, getTeams } from '../../../../services/adapter';
import { getTournamentResponseByEndpointName } from '../../../../services/tournament';

function TournamentLogo({ tournamentDataFull }: { tournamentDataFull: Tournament }) {
  if (tournamentDataFull == null) {
    return <Skeleton height={150} radius="xl" mb="xl" />;
  }
  return tournamentDataFull.logo_path ? (
    <Image
      radius="lg"
      mt={12}
      src={`${getBaseApiUrl()}/static/${tournamentDataFull.logo_path}`}
      style={{ maxWidth: '400px' }}
    />
  ) : null;
}

function TournamentHeadTitle({ tournamentDataFull }: { tournamentDataFull: Tournament }) {
  return tournamentDataFull != null ? (
    <title>{tournamentDataFull.name}</title>
  ) : (
    <title>Bracket</title>
  );
}

function TournamentTitle({ tournamentDataFull }: { tournamentDataFull: Tournament }) {
  return tournamentDataFull != null ? (
    <Title>{tournamentDataFull.name}</Title>
  ) : (
    <Skeleton height={50} radius="lg" mb="xl" />
  );
}

export default function Standings() {
  const tournamentResponse = getTournamentResponseByEndpointName();

  // Hack to avoid unequal number of rendered hooks.
  const tournamentId = tournamentResponse != null ? tournamentResponse[0].id : -1;

  const swrTeamsResponse: SWRResponse = getTeams(tournamentId);

  if (tournamentResponse == null) {
    return <NotFoundTitle />;
  }

  const tournamentDataFull = tournamentResponse[0];

  return (
    <>
      <Head>
        <TournamentHeadTitle tournamentDataFull={tournamentDataFull} />
      </Head>
      <Grid grow style={{ margin: '20px' }}>
        <Grid.Col span={2}>
          <TournamentTitle tournamentDataFull={tournamentDataFull} />
          <TournamentLogo tournamentDataFull={tournamentDataFull} />
        </Grid.Col>
        <Grid.Col span={10}>
          <StandingsTable swrTeamsResponse={swrTeamsResponse} />
        </Grid.Col>
      </Grid>
    </>
  );
}
