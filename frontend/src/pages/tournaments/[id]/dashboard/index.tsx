import { Center, Grid, Image, Skeleton, Title } from '@mantine/core';
import Head from 'next/head';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../404';
import Brackets from '../../../../components/brackets/brackets';
import StagesTab from '../../../../components/utils/stages_tab';
import { responseIsValid } from '../../../../components/utils/util';
import { StageWithRounds } from '../../../../interfaces/stage';
import { Tournament } from '../../../../interfaces/tournament';
import { getBaseApiUrl, getCourts, getStages } from '../../../../services/adapter';
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

export default function Index() {
  const tournamentResponse = getTournamentResponseByEndpointName();

  // Hack to avoid unequal number of rendered hooks.
  const tournamentId = tournamentResponse != null ? tournamentResponse[0].id : -1;

  const swrStagesResponse: SWRResponse = getStages(tournamentId, true);
  const swrCourtsResponse: SWRResponse = getCourts(tournamentId);
  const [selectedStageId, setSelectedStageId] = useState(null);

  if (tournamentResponse == null) {
    return <NotFoundTitle />;
  }

  const tournamentDataFull = tournamentResponse[0];

  if (responseIsValid(swrStagesResponse)) {
    const activeTab = swrStagesResponse.data.data.filter(
      (stage: StageWithRounds) => stage.is_active
    );

    if (activeTab.length > 0 && selectedStageId == null && activeTab[0].id != null) {
      setSelectedStageId(activeTab[0].id.toString());
    }
  }

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
          <Center>
            <StagesTab
              selectedStageId={selectedStageId}
              swrStagesResponse={swrStagesResponse}
              setSelectedStageId={setSelectedStageId}
            />
          </Center>
          <Brackets
            tournamentData={tournamentDataFull}
            swrStagesResponse={swrStagesResponse}
            swrCourtsResponse={swrCourtsResponse}
            swrUpcomingMatchesResponse={null}
            readOnly
            selectedStageId={selectedStageId}
          />
        </Grid.Col>
      </Grid>
    </>
  );
}
