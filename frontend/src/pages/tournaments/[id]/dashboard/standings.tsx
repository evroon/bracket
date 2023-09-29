import { Grid, Image, Skeleton, Title } from '@mantine/core';
import Head from 'next/head';
import React from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../404';
import StandingsTable from '../../../../components/tables/standings';
import { getTournamentIdFromRouter } from '../../../../components/utils/util';
import { Tournament } from '../../../../interfaces/tournament';
import { getBaseApiUrl, getTeams, getTournament } from '../../../../services/adapter';

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

export default function Standings() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrTeamsResponse: SWRResponse = getTeams(tournamentData.id);
  const swrTournamentsResponse = getTournament(tournamentData.id);

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
          <StandingsTable swrTeamsResponse={swrTeamsResponse} />
        </Grid.Col>
      </Grid>
    </>
  );
}
