import { Grid } from '@mantine/core';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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
      <Grid style={{ margin: '1rem' }} gutter="2rem">
        <Grid.Col span={{ base: 12, lg: 2 }}>
          <TournamentTitle tournamentDataFull={tournamentDataFull} />
          <TournamentLogo tournamentDataFull={tournamentDataFull} />
          <TournamentQRCode tournamentDataFull={tournamentDataFull} />
        </Grid.Col>
        <Grid.Col span="auto">
          <StandingsTable swrTeamsResponse={swrTeamsResponse} />
        </Grid.Col>
      </Grid>
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
