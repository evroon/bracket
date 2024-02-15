import { Group, Stack } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

import Builder from '../../../components/builder/builder';
import { CreateStageButtonLarge } from '../../../components/buttons/create_stage';
import {
  NextStageButton,
  PreviousStageButton,
} from '../../../components/buttons/next_stage_button';
import { NoContent } from '../../../components/no_content/empty_table_info';
import { TableSkeletonTwoColumnsSmall } from '../../../components/utils/skeletons';
import { getTournamentIdFromRouter } from '../../../components/utils/util';
import { StageWithStageItems } from '../../../interfaces/stage';
import { getStages, getTournamentById } from '../../../services/adapter';
import TournamentLayout from '../_tournament_layout';

export default function StagesPage() {
  const { t } = useTranslation();
  const { tournamentData } = getTournamentIdFromRouter();
  const swrStagesResponse = getStages(tournamentData.id);
  const swrTournamentResponse = getTournamentById(tournamentData.id);
  const tournamentDataFull =
    swrTournamentResponse.data != null ? swrTournamentResponse.data.data : null;

  const stages: StageWithStageItems[] =
    swrStagesResponse.data != null ? swrStagesResponse.data.data : [];

  let content;
  if (swrStagesResponse.isLoading || swrTournamentResponse.isLoading) {
    content = <TableSkeletonTwoColumnsSmall />;
  } else if (stages.length < 1) {
    content = (
      <Stack align="center">
        <NoContent title={t('no_matches_title')} description={t('no_matches_description')} />
        <CreateStageButtonLarge
          tournament={tournamentDataFull}
          swrStagesResponse={swrStagesResponse}
        />
      </Stack>
    );
  } else {
    content = (
      <>
        <Group grow mt="1rem" maw="30rem">
          <PreviousStageButton
            tournamentData={tournamentData}
            swrStagesResponse={swrStagesResponse}
          />
          <NextStageButton tournamentData={tournamentData} swrStagesResponse={swrStagesResponse} />
        </Group>
        <Group mt="1rem" align="top">
          <Builder tournament={tournamentDataFull} swrStagesResponse={swrStagesResponse} />
        </Group>
      </>
    );
  }

  return <TournamentLayout tournament_id={tournamentData.id}>{content}</TournamentLayout>;
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
