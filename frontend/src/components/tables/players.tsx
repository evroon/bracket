import React from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { Tournament } from '../../interfaces/tournament';
import { deletePlayer } from '../../services/player';
import DeleteButton from '../buttons/delete';
import PlayerModal from '../modals/player_modal';
import DateTime from '../utils/datetime';
import ErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function PlayersTable({
  swrPlayersResponse,
  tournamentData,
}: {
  swrPlayersResponse: SWRResponse;
  tournamentData: Tournament;
}) {
  const players: Player[] = swrPlayersResponse.data != null ? swrPlayersResponse.data.data : [];
  const tableState = getTableState('name');

  if (swrPlayersResponse.error) return ErrorAlert(swrPlayersResponse.error);

  const rows = players
    .sort((p1: Player, p2: Player) => sortTableEntries(p1, p2, tableState))
    .map((row) => (
      <tr key={row.name}>
        <td>{row.name}</td>
        <td>
          <DateTime datetime={row.created} />
        </td>
        <td>
          <PlayerModal
            swrPlayersResponse={swrPlayersResponse}
            tournament_id={tournamentData.id}
            player={row}
          />
          <DeleteButton
            onClick={async () => {
              await deletePlayer(tournamentData.id, row.id);
              await swrPlayersResponse.mutate(null);
            }}
            title="Delete Player"
          />
        </td>
      </tr>
    ));

  return (
    <TableLayout>
      <thead>
        <tr>
          <ThSortable state={tableState} field="name">
            Title
          </ThSortable>
          <ThSortable state={tableState} field="created">
            Created
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayout>
  );
}
