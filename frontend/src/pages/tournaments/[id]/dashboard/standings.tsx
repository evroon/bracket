import { Grid, MediaQuery } from '@mantine/core';
import Head from 'next/head';
import React from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../404';
import {
  TournamentHeadTitle,
  TournamentLogo,
  TournamentQRCode,
  TournamentTitle,
} from '../../../../components/dashboard/layout';
import StandingsTable from '../../../../components/tables/standings';
import { TableSkeletonTwoColumns } from '../../../../components/utils/skeletons';
import { getTeamsLive } from '../../../../services/adapter';
import { getTournamentResponseByEndpointName } from '../../../../services/tournament';

export default function Standings() {
  const tournamentResponse = getTournamentResponseByEndpointName();

  // Hack to avoid unequal number of rendered hooks.
  const notFound = tournamentResponse == null || tournamentResponse[0] == null;
  const tournamentId = !notFound ? tournamentResponse[0].id : -1;

  const swrTeamsResponse: SWRResponse = getTeamsLive(tournamentId);

  if (swrTeamsResponse.isLoading) {
    return <TableSkeletonTwoColumns />;
  }

  if (notFound) {
    return <NotFoundTitle />;
  }

  const tournamentDataFull = tournamentResponse[0];

  return (
    <>
      <Head>
        <TournamentHeadTitle tournamentDataFull={tournamentDataFull} />
      </Head>
      <Grid grow style={{ margin: '1rem' }} gutter="2rem">
        <MediaQuery query="(max-width: 80em)" styles={{ display: 'none' }}>
          <Grid.Col span={2}>
            <TournamentTitle tournamentDataFull={tournamentDataFull} />
            <TournamentLogo tournamentDataFull={tournamentDataFull} />
            <TournamentQRCode tournamentDataFull={tournamentDataFull} />
          </Grid.Col>
        </MediaQuery>
        <Grid.Col span={10}>
          <StandingsTable swrTeamsResponse={swrTeamsResponse} />
        </Grid.Col>
      </Grid>
    </>
  );
}
