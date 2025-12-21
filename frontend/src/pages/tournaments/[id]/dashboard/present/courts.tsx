import { Grid } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import CourtsLarge, { CourtBadge } from '../../../../../components/brackets/courts_large';
import {
  TournamentLogo,
  TournamentQRCode,
  TournamentTitle,
  getTournamentHeadTitle,
} from '../../../../../components/dashboard/layout';
import { TableSkeletonTwoColumns } from '../../../../../components/utils/skeletons';
import { responseIsValid, setTitle } from '../../../../../components/utils/util';
import {
  MatchInterface,
  isMatchHappening,
  isMatchInTheFuture,
} from '../../../../../interfaces/match';
import { Court } from '../../../../../openapi';
import { getCourtsLive, getStagesLive } from '../../../../../services/adapter';
import { getTournamentResponseByEndpointName } from '../../../../../services/dashboard';
import { getMatchLookupByCourt, getStageItemLookup } from '../../../../../services/lookups';

export default function CourtsPresentPage() {
  const { t } = useTranslation();
  const tournamentDataFull = getTournamentResponseByEndpointName();
  const tournamentValid = !React.isValidElement(tournamentDataFull);

  const swrCourtsResponse = getCourtsLive(tournamentValid ? tournamentDataFull.id : null);
  const swrStagesResponse = getStagesLive(tournamentValid ? tournamentDataFull.id : null);

  if (!tournamentValid) {
    return tournamentDataFull;
  }

  if (swrStagesResponse.isLoading || swrCourtsResponse.data == null || !tournamentValid) {
    return <TableSkeletonTwoColumns />;
  }

  setTitle(getTournamentHeadTitle(tournamentDataFull));

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
        (m1.start_time || '') > (m2.start_time || '') ? 1 : -1
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
