import React from 'react';
import { SWRResponse } from 'swr';

import { UpcomingMatchInterface } from '../../interfaces/match';
import PlayerList from '../info/player_list';
import ErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function UpcomingMatchesTable({
  swrUpcomingMatchesResponse,
}: {
  swrUpcomingMatchesResponse: SWRResponse;
}) {
  const upcoming_matches: UpcomingMatchInterface[] =
    swrUpcomingMatchesResponse.data != null ? swrUpcomingMatchesResponse.data.data : [];
  const tableState = getTableState('team1');

  if (swrUpcomingMatchesResponse.error) return ErrorAlert(swrUpcomingMatchesResponse.error);

  const rows = upcoming_matches
    .sort((m1: UpcomingMatchInterface, m2: UpcomingMatchInterface) =>
      sortTableEntries(m1, m2, tableState)
    )
    .map((upcoming_match: UpcomingMatchInterface) => (
      <tr key={upcoming_match.id}>
        <td>
          <PlayerList team={upcoming_match.team1} />
        </td>
        <td>
          <PlayerList team={upcoming_match.team2} />
        </td>
      </tr>
    ));

  return (
    <TableLayout>
      <thead>
        <tr>
          <ThSortable state={tableState} field="name">
            Team 1
          </ThSortable>
          <ThSortable state={tableState} field="name">
            Team 2
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayout>
  );
}
