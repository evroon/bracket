import { Center, Grid } from '@mantine/core';
import Head from 'next/head';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../404';
import Brackets from '../../../../components/brackets/brackets';
import {
  TournamentHeadTitle,
  TournamentLogo,
  TournamentTitle,
} from '../../../../components/dashboard/layout';
import StagesTab from '../../../../components/utils/stages_tab';
import { responseIsValid } from '../../../../components/utils/util';
import { StageWithRounds } from '../../../../interfaces/stage';
import { getCourts, getStages } from '../../../../services/adapter';
import { getTournamentResponseByEndpointName } from '../../../../services/tournament';

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
