import { Badge, Table } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { TeamInterface } from '../../interfaces/team';
import { TournamentMinimal } from '../../interfaces/tournament';
import { deleteTeam } from '../../services/team';
import DeleteButton from '../buttons/delete';
import PlayerList from '../info/player_list';
import TeamUpdateModal from '../modals/team_update_modal';
import { EmptyTableInfo } from '../no_content/empty_table_info';
import { DateTime } from '../utils/datetime';
import RequestErrorAlert from '../utils/error_alert';
import { TableSkeletonSingleColumn } from '../utils/skeletons';
import TableLayout, { TableState, ThNotSortable, ThSortable, sortTableEntries } from './table';

export default function TeamsTable({
  tournamentData,
  swrTeamsResponse,
  teams,
  tableState,
}: {
  tournamentData: TournamentMinimal;
  swrTeamsResponse: SWRResponse;
  teams: TeamInterface[];
  tableState: TableState;
}) {
  const { t } = useTranslation();
  if (swrTeamsResponse.error) return <RequestErrorAlert error={swrTeamsResponse.error} />;

  if (swrTeamsResponse.isLoading) {
    return <TableSkeletonSingleColumn />;
  }

  const rows = teams
    .sort((p1: TeamInterface, p2: TeamInterface) => sortTableEntries(p1, p2, tableState))
    .map((team) => (
      <Table.Tr key={team.id}>
        <Table.Td>
          {team.active ? (
            <Badge color="green">{t('active')}</Badge>
          ) : (
            <Badge color="red">{t('inactive')}</Badge>
          )}
        </Table.Td>
        <Table.Td>{team.name}</Table.Td>
        <Table.Td>
          <PlayerList team={team} />
        </Table.Td>
        <Table.Td>
          <DateTime datetime={team.created} />
        </Table.Td>
        <Table.Td>{Number(team.swiss_score).toFixed(1)}</Table.Td>
        <Table.Td>{Number(team.elo_score).toFixed(0)}</Table.Td>
        <Table.Td>
          <TeamUpdateModal
            tournament_id={tournamentData.id}
            team={team}
            swrTeamsResponse={swrTeamsResponse}
          />
          <DeleteButton
            onClick={async () => {
              await deleteTeam(tournamentData.id, team.id);
              await swrTeamsResponse.mutate();
            }}
            title={t('delete_team_button')}
          />
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name={t('teams_title')} />;

  return (
    <TableLayout miw={850}>
      <Table.Thead>
        <Table.Tr>
          <ThSortable state={tableState} field="active">
            {t('status')}
          </ThSortable>
          <ThSortable state={tableState} field="name">
            {t('name_table_header')}
          </ThSortable>
          <ThNotSortable>{t('members_table_header')}</ThNotSortable>
          <ThSortable state={tableState} field="created">
            {t('created')}
          </ThSortable>
          <ThSortable state={tableState} field="swiss_score">
            {t('swiss_score')}
          </ThSortable>
          <ThSortable state={tableState} field="elo_score">
            {t('elo_score')}
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </TableLayout>
  );
}
