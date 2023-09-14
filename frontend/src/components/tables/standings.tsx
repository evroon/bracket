import React from 'react';
// @ts-ignore
import EllipsisText from 'react-ellipsis-text';
import { SWRResponse } from 'swr';

import { TeamInterface } from '../../interfaces/team';
import PlayerList from '../info/player_list';
import { PlayerScore } from '../info/player_score';
import { WinDistribution } from '../info/player_statistics';
import { EmptyTableInfo } from '../utils/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import { WinDistributionTitle } from './players';
import { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';
import TableLayoutLarge from './table_large';

export default function StandingsTable({ swrTeamsResponse }: { swrTeamsResponse: SWRResponse }) {
  const teams: TeamInterface[] = swrTeamsResponse.data != null ? swrTeamsResponse.data.data : [];
  const tableState = getTableState('elo_score', false);

  if (swrTeamsResponse.error) return <RequestErrorAlert error={swrTeamsResponse.error} />;

  const minELOScore = Math.min(...teams.map((team) => team.elo_score));
  const maxELOScore = Math.max(...teams.map((team) => team.elo_score));

  const rows = teams
    .sort((p1: TeamInterface, p2: TeamInterface) => (p1.name < p2.name ? 1 : 0))
    .sort((p1: TeamInterface, p2: TeamInterface) => (p1.draws > p2.draws ? 1 : 0))
    .sort((p1: TeamInterface, p2: TeamInterface) => (p1.wins > p2.wins ? 1 : 0))
    .sort((p1: TeamInterface, p2: TeamInterface) => sortTableEntries(p1, p2, tableState))
    .slice(0, 15)
    .map((team, index) => (
      <tr key={team.id}>
        <td>{index + 1}</td>
        <td>
          <EllipsisText text={team.name} length={50} />
        </td>
        <td>
          <PlayerList team={team} />
        </td>
        <td>
          <PlayerScore
            score={team.elo_score}
            min_score={minELOScore}
            max_score={maxELOScore}
            color="indigo"
            decimals={0}
          />
        </td>
        <td>
          <WinDistribution wins={team.wins} draws={team.draws} losses={team.losses} />
        </td>
      </tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name="teams" />;

  return (
    <TableLayoutLarge display_mode="presentation">
      <thead>
        <tr>
          <ThNotSortable>#</ThNotSortable>
          <ThSortable state={tableState} field="name">
            Name
          </ThSortable>
          <ThNotSortable>Members</ThNotSortable>
          <ThSortable state={tableState} field="elo_score">
            ELO score
          </ThSortable>
          <ThNotSortable>
            <WinDistributionTitle />
          </ThNotSortable>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayoutLarge>
  );
}
