import { Table, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { StageItemWithRounds } from '../../interfaces/stage_item';
import { StageItemInput } from '../../interfaces/stage_item_input';
import { TeamInterface } from '../../interfaces/team';
import PlayerList from '../info/player_list';
import { PlayerScore } from '../info/player_score';
import { WinDistribution } from '../info/player_statistics';
import { EmptyTableInfo } from '../no_content/empty_table_info';
import { WinDistributionTitle } from './players';
import { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';
import TableLayoutLarge from './table_large';

export default function StandingsTable({ teams }: { teams: TeamInterface[] }) {
  const { t } = useTranslation();
  const tableState = getTableState('elo_score', false);

  const minELOScore = Math.min(...teams.map((team) => team.elo_score));
  const maxELOScore = Math.max(...teams.map((team) => team.elo_score));

  const rows = teams
    .sort((p1: TeamInterface, p2: TeamInterface) => (p1.name < p2.name ? 1 : -1))
    .sort((p1: TeamInterface, p2: TeamInterface) => (p1.draws > p2.draws ? 1 : -1))
    .sort((p1: TeamInterface, p2: TeamInterface) => (p1.wins > p2.wins ? 1 : -1))
    .sort((p1: TeamInterface, p2: TeamInterface) => sortTableEntries(p1, p2, tableState))
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
    <TableLayoutLarge display_mode="presentation">
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

type TeamWithInput = { team: TeamInterface; input: StageItemInput };

export function StandingsTableForStageItem({
  teams_with_inputs,
  stageItem,
}: {
  teams_with_inputs: { team: TeamInterface; input: StageItemInput }[];
  stageItem: StageItemWithRounds;
}) {
  const { t } = useTranslation();
  const tableState = getTableState('points', false);

  const minPoints = Math.min(...teams_with_inputs.map((item) => item.input.points));
  const maxPoints = Math.max(...teams_with_inputs.map((item) => item.input.points));

  const rows = teams_with_inputs
    .sort((p1: TeamWithInput, p2: TeamWithInput) => (p1.input.points > p2.input.points ? 1 : -1))
    .sort((p1: TeamWithInput, p2: TeamWithInput) =>
      sortTableEntries(p1.input, p2.input, tableState)
    )
    .map((team_with_input, index) => (
      <Table.Tr key={team_with_input.team.id}>
        <Table.Td style={{ width: '2rem' }}>{index + 1}</Table.Td>
        <Table.Td style={{ width: '20rem' }}>
          <Text truncate="end" lineClamp={1}>
            {team_with_input.team.name}
          </Text>
        </Table.Td>
        <Table.Td visibleFrom="sm" style={{ width: '16rem' }}>
          <PlayerList team={team_with_input.team} />
        </Table.Td>
        <Table.Td visibleFrom="sm" style={{ width: '6rem' }}>
          <Text truncate="end" lineClamp={1}>
            {team_with_input.input.points}
          </Text>
        </Table.Td>
        {stageItem.type === 'SWISS' ? (
          <Table.Td>
            <PlayerScore
              score={team_with_input.input.points}
              min_score={minPoints}
              max_score={maxPoints}
              decimals={0}
            />
          </Table.Td>
        ) : (
          <Table.Td style={{ minWidth: '10rem' }}>
            <WinDistribution
              wins={team_with_input.input.wins}
              draws={team_with_input.input.draws}
              losses={team_with_input.input.losses}
            />
          </Table.Td>
        )}
      </Table.Tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name={t('teams_title')} />;

  return (
    <TableLayoutLarge display_mode="presentation">
      <Table.Thead>
        <Table.Tr>
          <ThNotSortable>#</ThNotSortable>
          <ThSortable state={tableState} field="name">
            {t('name_table_header')}
          </ThSortable>
          <ThNotSortable visibleFrom="sm">{t('members_table_header')}</ThNotSortable>
          <ThSortable visibleFrom="sm" state={tableState} field="points">
            {t('points_table_header')}
          </ThSortable>
          {stageItem.type === 'SWISS' ? (
            <ThSortable state={tableState} field="elo_score">
              {t('elo_score')}
            </ThSortable>
          ) : (
            <ThNotSortable>
              <WinDistributionTitle />
            </ThNotSortable>
          )}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </TableLayoutLarge>
  );
}
