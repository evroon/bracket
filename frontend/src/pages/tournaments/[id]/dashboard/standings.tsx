import { Container, Text } from '@mantine/core';
import { AiOutlineHourglass } from '@react-icons/all-files/ai/AiOutlineHourglass';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../404';
import { DashboardFooter } from '../../../../components/dashboard/footer';
import { DoubleHeader, getTournamentHeadTitle } from '../../../../components/dashboard/layout';
import { NoContent } from '../../../../components/no_content/empty_table_info';
import { StandingsTableForStageItem } from '../../../../components/tables/standings';
import { TableSkeletonTwoColumns } from '../../../../components/utils/skeletons';
import { responseIsValid, setTitle } from '../../../../components/utils/util';
import { getStagesLive } from '../../../../services/adapter';
import { getStageItemLookup, getStageItemTeamsLookup } from '../../../../services/lookups';
import { getTournamentResponseByEndpointName } from '../../../../services/tournament';

export function StandingsContent({
  swrStagesResponse,
  fontSizeInPixels,
  maxTeamsToDisplay,
}: {
  swrStagesResponse: SWRResponse;
  fontSizeInPixels: number;
  maxTeamsToDisplay: number;
}) {
  const { t } = useTranslation();

  const stageItemsLookup = getStageItemLookup(swrStagesResponse);
  const stageItemTeamLookup = responseIsValid(swrStagesResponse)
    ? getStageItemTeamsLookup(swrStagesResponse)
    : {};

  const rows = Object.keys(stageItemTeamLookup)
    .filter((stageItemId) => stageItemsLookup[stageItemId] != null)
    .sort((si1: any, si2: any) =>
      stageItemsLookup[si1].name > stageItemsLookup[si2].name ? 1 : -1
    )
    .map((stageItemId) => (
      <div key={stageItemId}>
        <Text size="xl" mt="md" mb="xs" inherit>
          {stageItemsLookup[stageItemId].name}
        </Text>
        <StandingsTableForStageItem
          teams_with_inputs={stageItemTeamLookup[stageItemId]}
          stageItem={stageItemsLookup[stageItemId]}
          stageItemsLookup={stageItemsLookup}
          fontSizeInPixels={fontSizeInPixels}
          maxTeamsToDisplay={maxTeamsToDisplay}
        />
      </div>
    ));

  if (rows.length < 1) {
    return (
      <NoContent
        title={`${t('could_not_find_any_alert')} ${t('teams_title')}`}
        description=""
        icon={<AiOutlineHourglass />}
      />
    );
  }
  return rows;
}

export default function DashboardStandingsPage() {
  const tournamentResponse = getTournamentResponseByEndpointName();

  const tournamentDataFull = tournamentResponse ? tournamentResponse[0] : null;

  const notFound = tournamentDataFull == null;
  const tournamentId = !notFound ? tournamentDataFull.id : null;

  const swrStagesResponse = getStagesLive(tournamentId);

  setTitle(getTournamentHeadTitle(tournamentDataFull));

  if (!tournamentResponse) {
    return <TableSkeletonTwoColumns />;
  }

  if (swrStagesResponse.isLoading) {
    return <TableSkeletonTwoColumns />;
  }

  if (notFound) {
    return <NotFoundTitle />;
  }

  return (
    <>
      <DoubleHeader tournamentData={tournamentDataFull} />
      <Container mt="1rem" px="0rem">
        <Container style={{ width: '100%' }} px="sm">
          <StandingsContent
            swrStagesResponse={swrStagesResponse}
            fontSizeInPixels={16}
            maxTeamsToDisplay={100}
          />
        </Container>
      </Container>
      <DashboardFooter />
    </>
  );
}
