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
import { StandingsTableForStageItem } from '../../../../components/tables/standings';
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
    .sort((si1: any, si2: any) =>
      stageItemsLookup[si1].name > stageItemsLookup[si2].name ? 1 : -1
    )
    .map((stageItemId) => (
      <div key={stageItemId}>
        <Text size="xl" mt="md" mb="xs">
          {stageItemsLookup[stageItemId].name}
        </Text>
        <StandingsTableForStageItem
          teams_with_inputs={stageItemTeamLookup[stageItemId]}
          stageItem={stageItemsLookup[stageItemId]}
        />
      </div>
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

  const tournamentDataFull = tournamentResponse ? tournamentResponse[0] : null;

  const notFound = tournamentDataFull == null;
  const tournamentId = !notFound ? tournamentDataFull.id : null;

  const swrStagesResponse = getStagesLive(tournamentId);
  const swrTeamsResponse: SWRResponse = getTeamsLive(tournamentId);

  if (!tournamentResponse) {
    return <TableSkeletonTwoColumns />;
  }

  if (swrTeamsResponse.isLoading || swrStagesResponse.isLoading) {
    return <TableSkeletonTwoColumns />;
  }

  if (notFound) {
    return <NotFoundTitle />;
  }

  return (
    <>
      <Head>
        <TournamentHeadTitle tournamentDataFull={tournamentDataFull} />
      </Head>
      <DoubleHeader tournamentData={tournamentDataFull} />
      <Container mt="1rem" px="0rem">
        <Container style={{ width: '100%' }} px="sm">
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
