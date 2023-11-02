import { Alert, Center, Grid } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import Head from 'next/head';
import React from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../404';
import CourtsLarge from '../../../../components/brackets/courts_large';
import {
  TournamentHeadTitle,
  TournamentLogo,
  TournamentQRCode,
  TournamentTitle,
} from '../../../../components/dashboard/layout';
import { responseIsValid } from '../../../../components/utils/util';
import { RoundInterface } from '../../../../interfaces/round';
import { getActiveStage } from '../../../../interfaces/stage';
import { getStagesLive } from '../../../../services/adapter';
import { getActiveRounds } from '../../../../services/lookups';
import { getTournamentResponseByEndpointName } from '../../../../services/tournament';

export default function CourtsPage() {
  const tournamentResponse = getTournamentResponseByEndpointName();

  // Hack to avoid unequal number of rendered hooks.
  const notFound = tournamentResponse == null || tournamentResponse[0] == null;
  const tournamentId = !notFound ? tournamentResponse[0].id : -1;

  const swrStagesResponse: SWRResponse = getStagesLive(tournamentId, true);

  if (notFound) {
    return <NotFoundTitle />;
  }

  const tournamentDataFull = tournamentResponse[0];
  const activeStage = responseIsValid(swrStagesResponse) ? getActiveStage(swrStagesResponse) : null;

  if (activeStage == null) {
    return <NotFoundTitle />;
  }

  const activeRounds = getActiveRounds(swrStagesResponse);
  if (activeRounds.length < 1) {
    return (
      <Center>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="No active round"
          color="blue"
          radius="lg"
          mt={8}
        >
          There is currently no active round
        </Alert>
      </Center>
    );
  }
  const rows = activeRounds.map((activeRound: RoundInterface) => (
    <CourtsLarge tournamentData={tournamentDataFull} activeRound={activeRound} />
  ));

  return (
    <>
      <Head>
        <TournamentHeadTitle tournamentDataFull={tournamentDataFull} />
      </Head>
      <Grid grow style={{ margin: '20px' }}>
        <Grid.Col span={2}>
          <TournamentTitle tournamentDataFull={tournamentDataFull} />
          <TournamentLogo tournamentDataFull={tournamentDataFull} />
          <TournamentQRCode tournamentDataFull={tournamentDataFull} />
        </Grid.Col>
        <Grid.Col span={10}>{rows}</Grid.Col>
      </Grid>
    </>
  );
}
