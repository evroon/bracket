import { Grid } from '@mantine/core';
import React from 'react';

import {
  TournamentLogo,
  TournamentQRCode,
  TournamentTitle,
  getTournamentHeadTitle,
} from '@components/dashboard/layout';
import RequestErrorAlert from '@components/utils/error_alert';
import { TableSkeletonTwoColumns } from '@components/utils/skeletons';
import { setTitle } from '@components/utils/util';
import { StandingsContent } from '@pages/tournaments/[id]/dashboard/standings';
import { getStagesLive, getTeamsLive } from '@services/adapter';
import { getTournamentResponseByEndpointName } from '@services/dashboard';

export default function StandingsPresentPage() {
  const tournamentDataFull = getTournamentResponseByEndpointName();
  const tournamentValid = !React.isValidElement(tournamentDataFull);

  const swrTeamsResponse = getTeamsLive(tournamentValid ? tournamentDataFull.id : null);
  const swrStagesResponse = getStagesLive(tournamentValid ? tournamentDataFull.id : null);

  if (!tournamentValid) {
    return tournamentDataFull;
  }

  if (swrTeamsResponse.isLoading || tournamentDataFull == null) {
    return <TableSkeletonTwoColumns />;
  }

  setTitle(getTournamentHeadTitle(tournamentDataFull));

  if (swrTeamsResponse.error) return <RequestErrorAlert error={swrTeamsResponse.error} />;

  const fontSizeInPixels = 28;
  return (
    <>
      <Grid style={{ margin: '1rem' }} gutter="2rem">
        <Grid.Col span={{ base: 12, lg: 2 }}>
          <TournamentTitle tournamentDataFull={tournamentDataFull} />
          <TournamentLogo tournamentDataFull={tournamentDataFull} />
          <TournamentQRCode tournamentDataFull={tournamentDataFull} />
        </Grid.Col>
        <Grid.Col span="auto" style={{ fontSize: fontSizeInPixels }}>
          <StandingsContent
            swrStagesResponse={swrStagesResponse}
            fontSizeInPixels={fontSizeInPixels}
            maxTeamsToDisplay={14}
          />
        </Grid.Col>
      </Grid>
    </>
  );
}
