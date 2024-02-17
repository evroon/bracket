import { Center, Grid, Pagination, Select, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useState } from 'react';

import TeamCreateModal from '../../../components/modals/team_create_modal';
import { getTableState, tableStateToPagination } from '../../../components/tables/table';
import TeamsTable from '../../../components/tables/teams';
import {
  capitalize,
  getTournamentIdFromRouter,
  responseIsValid,
} from '../../../components/utils/util';
import { StageItemWithRounds } from '../../../interfaces/stage_item';
import { StageItemInput } from '../../../interfaces/stage_item_input';
import { TeamInterface } from '../../../interfaces/team';
import { getStages, getTeamsPaginated } from '../../../services/adapter';
import { getStageItemList, getStageItemTeamIdsLookup } from '../../../services/lookups';
import TournamentLayout from '../_tournament_layout';

function StageItemSelect({
  groupStageItems,
  setFilteredStageItemId,
}: {
  groupStageItems: any;
  setFilteredStageItemId: any;
}) {
  const { t } = useTranslation();
  if (groupStageItems == null) return null;
  const data = groupStageItems.map(([stage_item]: [StageItemWithRounds]) => ({
    value: `${stage_item.id}`,
    label: `${stage_item.name}`,
  }));
  return (
    <Select
      data={data}
      label={t('filter_stage_item_label')}
      placeholder={t('filter_stage_item_placeholder')}
      searchable
      limit={25}
      onChange={setFilteredStageItemId}
    />
  );
}

export default function Teams() {
  const tableState = getTableState('name');
  const { t } = useTranslation();
  const [filteredStageItemId, setFilteredStageItemId] = useState(null);
  const { tournamentData } = getTournamentIdFromRouter();
  const swrTeamsResponse = getTeamsPaginated(tournamentData.id, tableStateToPagination(tableState));
  const swrStagesResponse = getStages(tournamentData.id);
  const stageItemInputLookup = responseIsValid(swrStagesResponse)
    ? getStageItemList(swrStagesResponse)
    : [];
  const stageItemTeamLookup = responseIsValid(swrStagesResponse)
    ? getStageItemTeamIdsLookup(swrStagesResponse)
    : {};

  let teams: TeamInterface[] =
    swrTeamsResponse.data != null ? swrTeamsResponse.data.data.teams : [];
  const teamCount = swrTeamsResponse.data != null ? swrTeamsResponse.data.data.count : 1;

  if (filteredStageItemId != null) {
    teams = swrTeamsResponse.data.data.teams.filter(
      (team: StageItemInput) => stageItemTeamLookup[filteredStageItemId].indexOf(team.id) !== -1
    );
  }

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Grid justify="space-between" mb="1rem">
        <Grid.Col span="auto">
          <Title>{capitalize(t('teams_title'))}</Title>
        </Grid.Col>
        <Grid.Col span="content">
          <Grid align="flex-end">
            <Grid.Col span="auto">
              <StageItemSelect
                groupStageItems={Object.values(stageItemInputLookup)}
                setFilteredStageItemId={setFilteredStageItemId}
              />
            </Grid.Col>
            <Grid.Col span="auto">
              <TeamCreateModal
                swrTeamsResponse={swrTeamsResponse}
                tournament_id={tournamentData.id}
              />
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
      <TeamsTable
        swrTeamsResponse={swrTeamsResponse}
        tournamentData={tournamentData}
        teams={teams}
        tableState={tableState}
      />
      <Center mt="1rem">
        <Pagination
          value={tableState.page}
          onChange={tableState.setPage}
          total={1 + teamCount / tableState.pageSize}
          size="lg"
        />
      </Center>
    </TournamentLayout>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
