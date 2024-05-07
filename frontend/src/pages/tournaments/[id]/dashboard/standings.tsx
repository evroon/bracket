import { Container, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../404';
import { DashboardFooter } from '../../../../components/dashboard/footer';
import { DoubleHeader, TournamentHeadTitle } from '../../../../components/dashboard/layout';
import { NoContentDashboard } from '../../../../components/no_content/empty_table_info';
import StandingsTable from '../../../../components/tables/standings';
import RequestErrorAlert from '../../../../components/utils/error_alert';
import { TableSkeletonTwoColumns } from '../../../../components/utils/skeletons';
import { responseIsValid } from '../../../../components/utils/util';
import { getStagesLive, getTeamsLive } from '../../../../services/adapter';
import { getStageItemLookup, getStageItemTeamsLookup } from '../../../../services/lookups';
import { getTournamentResponseByEndpointName } from '../../../../services/tournament';

function StandingsContent({
  swrTeamsResponse,
  swrStagesResponse,
}: {
  swrTeamsResponse: SWRResponse;
  swrStagesResponse: SWRResponse;
}) {
  const { t } = useTranslation();

  const stageItemsLookup = getStageItemLookup(swrStagesResponse);
  const stageItemTeamLookup = responseIsValid(swrStagesResponse)
    ? getStageItemTeamsLookup(swrStagesResponse, swrTeamsResponse)
    : {};
  if (swrTeamsResponse.error) return <RequestErrorAlert error={swrTeamsResponse.error} />;

  const rows = Object.keys(stageItemTeamLookup)
    .filter((stageItemId) => stageItemsLookup[stageItemId] != null)
    .map((stageItemId) => (
      <>
        <Text size="xl" mt="md" mb="xs">
          {stageItemsLookup[stageItemId].name}
        </Text>
        <StandingsTable teams={stageItemTeamLookup[stageItemId]} />
      </>
    ));

  if (rows.length < 1) {
    return (
      <NoContentDashboard
        title={`${t('could_not_find_any_alert')} ${t('teams_title')}`}
        description=""
      />
    );
  }
  return rows;
}

export default function Standings() {
  const tournamentResponse = getTournamentResponseByEndpointName();

  // Hack to avoid unequal number of rendered hooks.
  const notFound = tournamentResponse == null || tournamentResponse[0] == null;
  const tournamentId = !notFound ? tournamentResponse[0].id : -1;

  const swrStagesResponse = getStagesLive(tournamentId);
  const swrTeamsResponse: SWRResponse = getTeamsLive(tournamentId);

  if (swrTeamsResponse.isLoading) {
    return <TableSkeletonTwoColumns />;
  }

  if (notFound) {
    return <NotFoundTitle />;
  }

  const tournamentDataFull = tournamentResponse[0];

  return (
    <>
      <Head>
        <TournamentHeadTitle tournamentDataFull={tournamentDataFull} />
      </Head>
      <DoubleHeader tournamentData={tournamentDataFull} />
      <Container mt="1rem" style={{ overflow: 'scroll' }} px="0rem">
        <Container style={{ width: '100%', minWidth: '40rem' }} px="sm">
          <StandingsContent
            swrTeamsResponse={swrTeamsResponse}
            swrStagesResponse={swrStagesResponse}
          />
        </Container>
      </Container>
      <DashboardFooter />
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
