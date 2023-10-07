import React from 'react';
import { SWRResponse } from 'swr';

import { TeamInterface } from '../../interfaces/team';
import PlayerList from '../info/player_list';
import { PlayerScore } from '../info/player_score';
import { EmptyTableInfo } from '../utils/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';
import TableLayoutLarge from './table_large';

export default function StandingsTable({ swrTeamsResponse }: { swrTeamsResponse: SWRResponse }) {
  const teams: TeamInterface[] = swrTeamsResponse.data != null ? swrTeamsResponse.data.data : [];
  const tableState = getTableState('swiss_score', false);

  if (swrTeamsResponse.error) return <RequestErrorAlert error={swrTeamsResponse.error} />;

  const maxELOScore = Math.max(...teams.map((team) => team.elo_score));
  const maxSwissScore = Math.max(...teams.map((team) => team.swiss_score));

  const rows = teams
    .sort((p1: TeamInterface, p2: TeamInterface) => sortTableEntries(p1, p2, tableState))
    .map((team) => (
      <tr key={team.id}>
        <td>{team.name}</td>
        <td>
          <PlayerList team={team} />
        </td>
        <td>
          <PlayerScore score={team.elo_score} max_score={maxELOScore} color="indigo" decimals={0} />
        </td>
        <td>
          <PlayerScore
            score={team.swiss_score}
            max_score={maxSwissScore}
            color="grape"
            decimals={1}
          />
        </td>
      </tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name="teams" />;

  return (
    <TableLayoutLarge display_mode="presentation">
      <thead>
        <tr>
          <ThSortable state={tableState} field="name">
            Name
          </ThSortable>
          <ThNotSortable>Members</ThNotSortable>
          <ThSortable state={tableState} field="elo_score">
            ELO score
          </ThSortable>
          <ThSortable state={tableState} field="swiss_score">
            Swiss score
          </ThSortable>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayoutLarge>
  );
}
