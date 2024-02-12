import { Table, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { TeamInterface } from '../../interfaces/team';
import PlayerList from '../info/player_list';
import { PlayerScore } from '../info/player_score';
import { WinDistribution } from '../info/player_statistics';
import { EmptyTableInfo } from '../no_content/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import { WinDistributionTitle } from './players';
import { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';
import TableLayoutLarge from './table_large';

export default function StandingsTable({ swrTeamsResponse }: { swrTeamsResponse: SWRResponse }) {
  const { t } = useTranslation();
  const teams: TeamInterface[] =
    swrTeamsResponse.data != null ? swrTeamsResponse.data.data.teams : [];
  const tableState = getTableState('elo_score', false);

  if (swrTeamsResponse.error) return <RequestErrorAlert error={swrTeamsResponse.error} />;

  const minELOScore = Math.min(...teams.map((team) => team.elo_score));
  const maxELOScore = Math.max(...teams.map((team) => team.elo_score));

  const rows = teams
    .sort((p1: TeamInterface, p2: TeamInterface) => (p1.name < p2.name ? 1 : -1))
    .sort((p1: TeamInterface, p2: TeamInterface) => (p1.draws > p2.draws ? 1 : -1))
    .sort((p1: TeamInterface, p2: TeamInterface) => (p1.wins > p2.wins ? 1 : -1))
    .sort((p1: TeamInterface, p2: TeamInterface) => sortTableEntries(p1, p2, tableState))
    .slice(0, 14)
    .map((team, index) => (
      <Table.Tr key={team.id}>
        <Table.Td>{index + 1}</Table.Td>
        <Table.Td>
          <Text>{team.name}</Text>
        </Table.Td>
        <Table.Td>
          <PlayerList team={team} />
        </Table.Td>
        <Table.Td>
          <PlayerScore
            score={team.elo_score}
            min_score={minELOScore}
            max_score={maxELOScore}
            decimals={0}
          />
        </Table.Td>
        <Table.Td>
          <WinDistribution wins={team.wins} draws={team.draws} losses={team.losses} />
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name={t('teams_title')} />;

  return (
    <TableLayoutLarge display_mode="presentation" miw={850}>
      <Table.Thead>
        <Table.Tr>
          <ThNotSortable>#</ThNotSortable>
          <ThSortable state={tableState} field="name">
            {t('name_table_header')}
          </ThSortable>
          <ThNotSortable>{t('members_table_header')}</ThNotSortable>
          <ThSortable state={tableState} field="elo_score">
            {t('elo_score')}
          </ThSortable>
          <ThNotSortable>
            <WinDistributionTitle />
          </ThNotSortable>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </TableLayoutLarge>
  );
}
