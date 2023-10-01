import { Grid } from '@mantine/core';
import Head from 'next/head';
import React from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../404';
import Courts from '../../../../components/brackets/courts';
import {
  TournamentHeadTitle,
  TournamentLogo,
  TournamentTitle,
} from '../../../../components/dashboard/layout';
import { responseIsValid } from '../../../../components/utils/util';
import { getActiveRound, getActiveStage } from '../../../../interfaces/stage';
import { getStages } from '../../../../services/adapter';
import { getTournamentResponseByEndpointName } from '../../../../services/tournament';

export default function CourtsPage() {
  const tournamentResponse = getTournamentResponseByEndpointName();

  // Hack to avoid unequal number of rendered hooks.
  const tournamentId = tournamentResponse != null ? tournamentResponse[0].id : -1;

  const swrStagesResponse: SWRResponse = getStages(tournamentId, true);

  if (tournamentResponse == null) {
    return <NotFoundTitle />;
  }

  const tournamentDataFull = tournamentResponse[0];
  const activeStage = responseIsValid(swrStagesResponse) ? getActiveStage(swrStagesResponse) : null;

  if (activeStage == null) {
    return <NotFoundTitle />;
  }

  const activeRound = getActiveRound(activeStage);

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
          <Courts tournamentData={tournamentDataFull} activeRound={activeRound} />
        </Grid.Col>
      </Grid>
    </>
  );
}
