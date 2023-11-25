import { Grid, Group, Select, Title } from '@mantine/core';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import TeamCreateModal from '../../../components/modals/team_create_modal';
import TeamsTable from '../../../components/tables/teams';
import { getTournamentIdFromRouter, responseIsValid } from '../../../components/utils/util';
import { StageItemWithRounds } from '../../../interfaces/stage_item';
import { StageItemInput } from '../../../interfaces/stage_item_input';
import { TeamInterface } from '../../../interfaces/team';
import { getStages, getTeams } from '../../../services/adapter';
import { getStageItemList, getStageItemTeamIdsLookup } from '../../../services/lookups';
import TournamentLayout from '../_tournament_layout';

function StageItemSelect({
  groupStageItems,
  setFilteredStageItemId,
}: {
  groupStageItems: any;
  setFilteredStageItemId: any;
}) {
  if (groupStageItems == null) return null;
  const data = groupStageItems.map(([stage_item]: [StageItemWithRounds]) => ({
    value: `${stage_item.id}`,
    label: `${stage_item.name}`,
  }));
  return (
    <Select
      data={data}
      label="Filter on stage item"
      placeholder="No filter"
      dropdownPosition="bottom"
      clearable
      searchable
      limit={25}
      onChange={(x) => {
        setFilteredStageItemId(x);
      }}
    />
  );
}

export default function Teams() {
  const [filteredStageItemId, setFilteredStageItemId] = useState(null);
  const { tournamentData } = getTournamentIdFromRouter();
  const swrTeamsResponse: SWRResponse = getTeams(tournamentData.id);
  const swrStagesResponse = getStages(tournamentData.id);
  const stageItemInputLookup = responseIsValid(swrStagesResponse)
    ? getStageItemList(swrStagesResponse)
    : [];
  const stageItemTeamLookup = responseIsValid(swrStagesResponse)
    ? getStageItemTeamIdsLookup(swrStagesResponse)
    : {};

  let teams: TeamInterface[] = swrTeamsResponse.data != null ? swrTeamsResponse.data.data : [];

  if (filteredStageItemId != null) {
    teams = swrTeamsResponse.data.data.filter(
      (team: StageItemInput) => stageItemTeamLookup[filteredStageItemId].indexOf(team.id) !== -1
    );
  }

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Grid grow mb="0.5rem">
        <Grid.Col span={6}>
          <Title>Teams</Title>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group position="right">
            <StageItemSelect
              groupStageItems={Object.values(stageItemInputLookup)}
              setFilteredStageItemId={setFilteredStageItemId}
            />
            <TeamCreateModal
              swrTeamsResponse={swrTeamsResponse}
              tournament_id={tournamentData.id}
            />
          </Group>
        </Grid.Col>
      </Grid>
      <TeamsTable
        swrTeamsResponse={swrTeamsResponse}
        tournamentData={tournamentData}
        teams={teams}
      />
    </TournamentLayout>
  );
}
