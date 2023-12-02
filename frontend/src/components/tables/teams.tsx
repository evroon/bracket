import { Badge, Table } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { TeamInterface } from '../../interfaces/team';
import { TournamentMinimal } from '../../interfaces/tournament';
import { deleteTeam } from '../../services/team';
import DeleteButton from '../buttons/delete';
import PlayerList from '../info/player_list';
import TeamUpdateModal from '../modals/team_update_modal';
import { DateTime } from '../utils/datetime';
import { EmptyTableInfo } from '../utils/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function TeamsTable({
  tournamentData,
  swrTeamsResponse,
  teams,
}: {
  tournamentData: TournamentMinimal;
  swrTeamsResponse: SWRResponse;
  teams: TeamInterface[];
}) {
  const tableState = getTableState('name');

  if (swrTeamsResponse.error) return <RequestErrorAlert error={swrTeamsResponse.error} />;

  const rows = teams
    .sort((p1: TeamInterface, p2: TeamInterface) => sortTableEntries(p1, p2, tableState))
    .map((team) => (
      <Table.Tr key={team.id}>
        <Table.Td>
          {team.active ? <Badge color="green">Active</Badge> : <Badge color="red">Inactive</Badge>}
        </Table.Td>
        <Table.Td>{team.name}</Table.Td>
        <Table.Td>
          <PlayerList team={team} />
        </Table.Td>
        <Table.Td>
          <DateTime datetime={team.created} />
        </Table.Td>
        <Table.Td>{team.swiss_score.toFixed(1)}</Table.Td>
        <Table.Td>{team.elo_score.toFixed(0)}</Table.Td>
        <Table.Td>
          <TeamUpdateModal
            tournament_id={tournamentData.id}
            team={team}
            swrTeamsResponse={swrTeamsResponse}
          />
          <DeleteButton
            onClick={async () => {
              await deleteTeam(tournamentData.id, team.id);
              await swrTeamsResponse.mutate(null);
            }}
            title="Delete Team"
          />
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name="teams" />;

  return (
    <TableLayout miw={850}>
      <Table.Thead>
        <Table.Tr>
          <ThSortable state={tableState} field="active">
            Status
          </ThSortable>
          <ThSortable state={tableState} field="name">
            Name
          </ThSortable>
          <ThNotSortable>Members</ThNotSortable>
          <ThSortable state={tableState} field="created">
            Created
          </ThSortable>
          <ThSortable state={tableState} field="swiss_score">
            Swiss score
          </ThSortable>
          <ThSortable state={tableState} field="elo_score">
            ELO score
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </TableLayout>
  );
}
