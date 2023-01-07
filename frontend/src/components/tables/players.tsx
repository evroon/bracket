import React from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { TournamentMinimal } from '../../interfaces/tournament';
import { deletePlayer } from '../../services/player';
import DeleteButton from '../buttons/delete';
import { PlayerELOScore } from '../info/player_elo_score';
import { PlayerStatistics } from '../info/player_statistics';
import PlayerModal from '../modals/player_modal';
import DateTime from '../utils/datetime';
import RequestErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function PlayersTable({
  swrPlayersResponse,
  tournamentData,
}: {
  swrPlayersResponse: SWRResponse;
  tournamentData: TournamentMinimal;
}) {
  const players: Player[] = swrPlayersResponse.data != null ? swrPlayersResponse.data.data : [];
  const tableState = getTableState('name');

  const maxELOScore = Math.max(...players.map((player) => player.elo_score));

  if (swrPlayersResponse.error) return <RequestErrorAlert error={swrPlayersResponse.error} />;

  const rows = players
    .sort((p1: Player, p2: Player) => sortTableEntries(p1, p2, tableState))
    .map((player) => (
      <tr key={player.name}>
        <td>{player.name}</td>
        <td>
          <DateTime datetime={player.created} />
        </td>
        <td>
          <PlayerStatistics wins={player.wins} draws={player.draws} losses={player.losses} />
        </td>
        <td>
          <PlayerELOScore elo_score={player.elo_score} max_elo_score={maxELOScore} />
        </td>
        <td>
          <PlayerModal
            swrPlayersResponse={swrPlayersResponse}
            tournament_id={tournamentData.id}
            player={player}
          />
          <DeleteButton
            onClick={async () => {
              await deletePlayer(tournamentData.id, player.id);
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
          <ThNotSortable>Win distribution</ThNotSortable>
          <ThSortable state={tableState} field="elo_score">
            ELO score
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayout>
  );
}
