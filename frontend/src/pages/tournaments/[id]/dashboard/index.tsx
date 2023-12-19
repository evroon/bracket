import { Center, Grid } from '@mantine/core';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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
import { BracketDisplaySettings } from '../../../../interfaces/brackets';
import { StageWithStageItems } from '../../../../interfaces/stage';
import { getStagesLive } from '../../../../services/adapter';
import { getTournamentResponseByEndpointName } from '../../../../services/tournament';

export default function Index() {
  const tournamentResponse = getTournamentResponseByEndpointName();

  // Hack to avoid unequal number of rendered hooks.
  const notFound = tournamentResponse == null || tournamentResponse[0] == null;
  const tournamentId = !notFound ? tournamentResponse[0].id : -1;

  const swrStagesResponse: SWRResponse = getStagesLive(tournamentId, true);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [matchVisibility, setMatchVisibility] = useState('all');
  const [teamNamesDisplay, setTeamNamesDisplay] = useState('team-names');
  const displaySettings: BracketDisplaySettings = {
    matchVisibility,
    setMatchVisibility,
    teamNamesDisplay,
    setTeamNamesDisplay,
  };
  if (notFound && !swrStagesResponse.isLoading) {
    return <NotFoundTitle />;
  }

  const tournamentDataFull = tournamentResponse != null ? tournamentResponse[0] : null;

  if (responseIsValid(swrStagesResponse)) {
    const activeTab = swrStagesResponse.data.data.filter(
      (stage: StageWithStageItems) => stage.is_active
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
      <Grid style={{ margin: '0.5rem' }}>
        <Grid.Col span={{ base: 12, lg: 2 }}>
          <TournamentTitle tournamentDataFull={tournamentDataFull} />
          <TournamentLogo tournamentDataFull={tournamentDataFull} />
        </Grid.Col>
        <Grid.Col span="auto">
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
            swrUpcomingMatchesResponse={null}
            readOnly
            selectedStageId={selectedStageId}
            displaySettings={displaySettings}
          />
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
