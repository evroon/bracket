import { Center, SegmentedControl, Stack } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { GraphicalBracket } from '@components/brackets/graphical_bracket';
import { DashboardFooter } from '@components/dashboard/footer';
import { DoubleHeader, getTournamentHeadTitle } from '@components/dashboard/layout';
import { NoContent } from '@components/no_content/empty_table_info';
import { responseIsValid, setTitle } from '@components/utils/util';
import { StageItemWithRounds } from '@openapi';
import { getStagesLive } from '@services/adapter';
import { getTournamentResponseByEndpointName } from '@services/dashboard';

export default function DashboardBracketPage() {
  const { t } = useTranslation();
  const tournamentDataFull = getTournamentResponseByEndpointName();
  const tournamentValid = !React.isValidElement(tournamentDataFull);

  const swrStagesResponse = getStagesLive(tournamentValid ? tournamentDataFull.id : null);

  const [selectedStageItemId, setSelectedStageItemId] = React.useState<string | null>(null);

  if (!tournamentValid) {
    return tournamentDataFull;
  }

  setTitle(getTournamentHeadTitle(tournamentDataFull));

  if (!responseIsValid(swrStagesResponse)) return null;

  // Get all elimination stage items
  const eliminationStageItems: StageItemWithRounds[] = [];
  for (const stage of swrStagesResponse.data?.data || []) {
    for (const stageItem of stage.stage_items || []) {
      if (stageItem.type === 'SINGLE_ELIMINATION' || stageItem.type === 'DOUBLE_ELIMINATION') {
        eliminationStageItems.push(stageItem);
      }
    }
  }

  if (eliminationStageItems.length === 0) {
    return (
      <>
        <DoubleHeader tournamentData={tournamentDataFull} />
        <Center style={{ minHeight: '50vh' }}>
          <NoContent title={t('no_elimination_brackets')} description="" />
        </Center>
        <DashboardFooter />
      </>
    );
  }

  // Default to first elimination stage item
  const currentStageItemId = selectedStageItemId || String(eliminationStageItems[0].id);
  const currentStageItem = eliminationStageItems.find(
    (si) => String(si.id) === currentStageItemId
  );

  return (
    <>
      <DoubleHeader tournamentData={tournamentDataFull} />
      <Stack px="1rem" pb="2rem">
        {eliminationStageItems.length > 1 && (
          <Center mt="md">
            <SegmentedControl
              value={currentStageItemId}
              onChange={setSelectedStageItemId}
              data={eliminationStageItems.map((si) => ({
                value: String(si.id),
                label: si.name,
              }))}
            />
          </Center>
        )}
        {currentStageItem && (
          <GraphicalBracket
            stageItem={currentStageItem}
            tournamentData={tournamentDataFull}
            swrStagesResponse={swrStagesResponse}
            swrUpcomingMatchesResponse={null}
            readOnly={true}
          />
        )}
      </Stack>
      <DashboardFooter />
    </>
  );
}
