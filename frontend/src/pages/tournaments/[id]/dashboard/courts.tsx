import { Grid } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../404';
import CourtsLarge, { CourtBadge } from '../../../../components/brackets/courts_large';
import {
  TournamentHeadTitle,
  TournamentLogo,
  TournamentQRCode,
  TournamentTitle,
} from '../../../../components/dashboard/layout';
import { TableSkeletonTwoColumns } from '../../../../components/utils/skeletons';
import { responseIsValid } from '../../../../components/utils/util';
import { Court } from '../../../../interfaces/court';
import { MatchInterface, isMatchHappening, isMatchInTheFuture } from '../../../../interfaces/match';
import { getCourtsLive, getStagesLive } from '../../../../services/adapter';
import { getMatchLookupByCourt } from '../../../../services/lookups';
import { getTournamentResponseByEndpointName } from '../../../../services/tournament';

export default function CourtsPage() {
  const { t } = useTranslation();
  const tournamentResponse = getTournamentResponseByEndpointName();

  // Hack to avoid unequal number of rendered hooks.
  const notFound = tournamentResponse == null || tournamentResponse[0] == null;
  const tournamentId = !notFound ? tournamentResponse[0].id : -1;

  const swrStagesResponse: SWRResponse = getStagesLive(tournamentId, true);
  const swrCourtsResponse: SWRResponse = getCourtsLive(tournamentId);

  if (swrStagesResponse.isLoading || swrCourtsResponse.isLoading) {
    return <TableSkeletonTwoColumns />;
  }

  if (notFound) {
    return <NotFoundTitle />;
  }

  const tournamentDataFull = tournamentResponse != null ? tournamentResponse[0] : null;
  const courts = responseIsValid(swrCourtsResponse) ? swrCourtsResponse.data.data : [];
  const matchesByCourtId = responseIsValid(swrStagesResponse)
    ? getMatchLookupByCourt(swrStagesResponse)
    : [];

  const rows = courts.map((court: Court) => {
    const matchesForCourt = matchesByCourtId[court.id] || [];
    const activeMatch = matchesForCourt.filter((m: MatchInterface) => isMatchHappening(m))[0];
    const futureMatch = matchesForCourt.filter((m: MatchInterface) => isMatchInTheFuture(m))[0];

    return (
      <CourtsLarge key={court.id} court={court} activeMatch={activeMatch} nextMatch={futureMatch} />
    );
  });
  const header = (
    <Grid align="center" gutter="2rem">
      <Grid.Col span={{ sm: 2 }} />
      <Grid.Col span={{ sm: 5 }}>
        <CourtBadge name={t('current_matches_badge')} color="teal" />
      </Grid.Col>
      <Grid.Col span={{ sm: 5 }}>
        <CourtBadge name={t('next_matches_badge')} color="gray" />
      </Grid.Col>
    </Grid>
  );

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
          {header}
          {rows}
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
