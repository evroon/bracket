import { Grid } from '@mantine/core';
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
import { responseIsValid } from '../../../../components/utils/util';
import { Court } from '../../../../interfaces/court';
import { MatchInterface, isMatchHappening, isMatchInTheFuture } from '../../../../interfaces/match';
import { getCourtsLive, getStagesLive } from '../../../../services/adapter';
import { getMatchLookupByCourt } from '../../../../services/lookups';
import { getTournamentResponseByEndpointName } from '../../../../services/tournament';

export default function CourtsPage() {
  const tournamentResponse = getTournamentResponseByEndpointName();

  // Hack to avoid unequal number of rendered hooks.
  const notFound = tournamentResponse == null || tournamentResponse[0] == null;
  const tournamentId = !notFound ? tournamentResponse[0].id : -1;

  const swrStagesResponse: SWRResponse = getStagesLive(tournamentId, true);
  const swrCourtsResponse: SWRResponse = getCourtsLive(tournamentId);

  if (notFound) {
    return <NotFoundTitle />;
  }

  const tournamentDataFull = tournamentResponse[0];
  const stages = responseIsValid(swrStagesResponse) ? swrStagesResponse.data.data : [];
  const courts = responseIsValid(swrCourtsResponse) ? swrCourtsResponse.data.data : [];
  const matchesByCourtId = responseIsValid(swrStagesResponse)
    ? getMatchLookupByCourt(swrStagesResponse)
    : [];

  if (courts.length < 1 || stages.length < 1) {
    return <NotFoundTitle />;
  }

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
      <Grid.Col sm={2} />
      <Grid.Col sm={5}>
        <Grid>
          <CourtBadge name="Current matches" color="teal" />
        </Grid>
      </Grid.Col>
      <Grid.Col sm={5}>
        <Grid>
          <CourtBadge name="Next matches" color="gray" />
        </Grid>
      </Grid.Col>
    </Grid>
  );

  return (
    <>
      <Head>
        <TournamentHeadTitle tournamentDataFull={tournamentDataFull} />
      </Head>
      <Grid grow style={{ margin: '1rem' }} gutter="2rem">
        <Grid.Col span={2}>
          <TournamentTitle tournamentDataFull={tournamentDataFull} />
          <TournamentLogo tournamentDataFull={tournamentDataFull} />
          <TournamentQRCode tournamentDataFull={tournamentDataFull} />
        </Grid.Col>
        <Grid.Col span={10}>
          {header}
          {rows}
        </Grid.Col>
      </Grid>
    </>
  );
}
