import React from 'react';
import { getPlayers } from '../../services/adapter';
import TableLayout, { getTableState, sortTableEntries, Th } from './table';
import ErrorAlert from '../utils/error_alert';
import DateTime from '../utils/datetime';
import { deletePlayer } from '../../services/player';
import PlayerModal from '../modals/player_modal';
import DeleteButton from '../buttons/delete';
import { Player } from '../../interfaces/player';

export default function PlayersTable({ tournament_id }: { tournament_id: number }) {
  const { data, error } = getPlayers(tournament_id);
  const players: Player[] = data != null ? data.data : [];
  const tableState = getTableState('name');

  if (error) return ErrorAlert(error);

  const rows = players
    .sort((p1: Player, p2: Player) => sortTableEntries(p1, p2, tableState))
    .map((row) => (
      <tr key={row.name}>
        <td>{row.name}</td>
        <td>
          <DateTime datetime={row.created} />
        </td>
        <td>
          <PlayerModal tournament_id={tournament_id} player={row} />

          <DeleteButton onClick={() => deletePlayer(tournament_id, row.id)} title="Delete Player" />
        </td>
      </tr>
    ));

  return (
    <TableLayout>
      <thead>
        <tr>
          <Th state={tableState} field="name">
            Title
          </Th>
          <Th state={tableState} field="created">
            Created
          </Th>
          <Th state={tableState} field="">
            {null}
          </Th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayout>
  );
}
