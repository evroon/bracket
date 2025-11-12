import { Grid } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../../404';
import CourtsLarge, { CourtBadge } from '../../../../../components/brackets/courts_large';
import {
  TournamentLogo,
  TournamentQRCode,
  TournamentTitle,
  getTournamentHeadTitle,
} from '../../../../../components/dashboard/layout';
import { TableSkeletonTwoColumns } from '../../../../../components/utils/skeletons';
import { responseIsValid, setTitle } from '../../../../../components/utils/util';
import { Court } from '../../../../../interfaces/court';
import {
  MatchInterface,
  isMatchHappening,
  isMatchInTheFuture,
} from '../../../../../interfaces/match';
import { getCourtsLive, getStagesLive } from '../../../../../services/adapter';
import { getMatchLookupByCourt, getStageItemLookup } from '../../../../../services/lookups';
import { getTournamentResponseByEndpointName } from '../../../../../services/tournament';

export default function CourtsPresentPage() {
  const { t } = useTranslation();
  const tournamentResponse = getTournamentResponseByEndpointName();

  // Hack to avoid unequal number of rendered hooks.
  const notFound = tournamentResponse == null || tournamentResponse[0] == null;
  const tournamentId = !notFound ? tournamentResponse[0].id : null;

  const swrStagesResponse: SWRResponse = getStagesLive(tournamentId);
  const swrCourtsResponse: SWRResponse = getCourtsLive(tournamentId);

  const tournamentDataFull = tournamentResponse != null ? tournamentResponse[0] : null;

  setTitle(getTournamentHeadTitle(tournamentDataFull));

  if (swrStagesResponse.isLoading || swrCourtsResponse.isLoading) {
    return <TableSkeletonTwoColumns />;
  }

  if (notFound) {
    return <NotFoundTitle />;
  }
  const stageItemsLookup = getStageItemLookup(swrStagesResponse);

  const courts = responseIsValid(swrCourtsResponse) ? swrCourtsResponse.data.data : [];
  const matchesByCourtId = responseIsValid(swrStagesResponse)
    ? getMatchLookupByCourt(swrStagesResponse)
    : [];

  const rows = courts.map((court: Court) => {
    const matchesForCourt = matchesByCourtId[court.id] || [];
    const activeMatch = matchesForCourt.filter((m: MatchInterface) => isMatchHappening(m))[0];
    const futureMatch = matchesForCourt
      .filter((m: MatchInterface) => isMatchInTheFuture(m))
      .sort((m1: MatchInterface, m2: MatchInterface) =>
        m1.start_time > m2.start_time ? 1 : -1
      )[0];

    return (
      <CourtsLarge
        key={court.id}
        court={court}
        activeMatch={activeMatch}
        nextMatch={futureMatch}
        stageItemsLookup={stageItemsLookup}
      />
    );
  });

  return (
    <>
      <Grid style={{ margin: '1rem' }} gutter="2rem">
        <Grid.Col span={{ base: 12, lg: 2 }}>
          <TournamentTitle tournamentDataFull={tournamentDataFull} />
          <TournamentLogo tournamentDataFull={tournamentDataFull} />
          <TournamentQRCode tournamentDataFull={tournamentDataFull} />
        </Grid.Col>
        <Grid.Col span="auto">
          <Grid align="center" gutter="2rem">
            <Grid.Col span={{ sm: 2 }} />
            <Grid.Col span={{ sm: 5 }}>
              <CourtBadge name={t('current_matches_badge')} color="teal" />
            </Grid.Col>
            <Grid.Col span={{ sm: 5 }}>
              <CourtBadge name={t('next_matches_badge')} color="gray" />
            </Grid.Col>
          </Grid>
          {rows}
        </Grid.Col>
      </Grid>
    </>
  );
}
