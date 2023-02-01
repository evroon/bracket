import { Badge } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { TournamentMinimal } from '../../interfaces/tournament';
import { deletePlayer } from '../../services/player';
import DeleteButton from '../buttons/delete';
import { PlayerScore } from '../info/player_score';
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
  const maxSwissScore = Math.max(...players.map((player) => player.swiss_score));

  if (swrPlayersResponse.error) return <RequestErrorAlert error={swrPlayersResponse.error} />;

  const rows = players
    .sort((p1: Player, p2: Player) => sortTableEntries(p1, p2, tableState))
    .map((player) => (
      <tr key={player.name}>
        <td>
          {player.active ? (
            <Badge color="green">Active</Badge>
          ) : (
            <Badge color="red">Inactive</Badge>
          )}
        </td>
        <td>{player.name}</td>
        <td>
          <DateTime datetime={player.created} />
        </td>
        <td>
          <PlayerStatistics wins={player.wins} draws={player.draws} losses={player.losses} />
        </td>
        <td>
          <PlayerScore
            score={player.elo_score}
            max_score={maxELOScore}
            color="indigo"
            decimals={0}
          />
        </td>
        <td>
          <PlayerScore
            score={player.swiss_score}
            max_score={maxSwissScore}
            color="grape"
            decimals={1}
          />
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
          <ThSortable state={tableState} field="active">
            Status
          </ThSortable>
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
          <ThSortable state={tableState} field="swiss_score">
            Swiss score
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayout>
  );
}
