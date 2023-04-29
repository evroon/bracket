import { Center, Grid, Image, Skeleton, Title } from '@mantine/core';
import Head from 'next/head';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../404';
import Brackets from '../../../components/brackets/brackets';
import StagesTab from '../../../components/utils/stages_tab';
import { getTournamentIdFromRouter } from '../../../components/utils/util';
import { Tournament } from '../../../interfaces/tournament';
import { getBaseApiUrl, getStages, getTournament } from '../../../services/adapter';

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

export default function Dashboard() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrStagesResponse: SWRResponse = getStages(tournamentData.id, true);
  const swrTournamentsResponse = getTournament(tournamentData.id);
  const [activeStageId, setActiveStageId] = useState(null);

  const tournamentDataFull: Tournament =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : null;

  if (tournamentDataFull == null && !swrTournamentsResponse.isLoading) {
    return <NotFoundTitle />;
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
            <StagesTab swrStagesResponse={swrStagesResponse} setActiveStageId={setActiveStageId} />
          </Center>
          <Brackets
            tournamentData={tournamentData}
            swrStagesResponse={swrStagesResponse}
            swrUpcomingMatchesResponse={null}
            readOnly
            activeStageId={activeStageId}
          />
        </Grid.Col>
      </Grid>
    </>
  );
}
