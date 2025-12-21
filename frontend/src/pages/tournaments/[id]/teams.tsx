import { Grid, Select, Title } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import TeamCreateModal from '@components/modals/team_create_modal';
import { getTableState, tableStateToPagination } from '@components/tables/table';
import TeamsTable from '@components/tables/teams';
import { capitalize, getTournamentIdFromRouter, responseIsValid } from '@components/utils/util';
import { FullTeamWithPlayers, StageItemWithRounds } from '@openapi';
import TournamentLayout from '@pages/tournaments/_tournament_layout';
import { getStages, getTeamsPaginated } from '@services/adapter';
import { getStageItemList, getStageItemTeamIdsLookup } from '@services/lookups';

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

export default function TeamsPage() {
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

  let teams: FullTeamWithPlayers[] =
    swrTeamsResponse.data != null ? swrTeamsResponse.data.data.teams : [];
  const teamCount = swrTeamsResponse.data != null ? swrTeamsResponse.data.data.count : 1;

  if (filteredStageItemId != null) {
    teams = (swrTeamsResponse.data?.data.teams || []).filter(
      (team: FullTeamWithPlayers) =>
        stageItemTeamLookup[filteredStageItemId].indexOf(team.id) !== -1
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
        teamCount={teamCount}
      />
    </TournamentLayout>
  );
}
