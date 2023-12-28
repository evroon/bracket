import { Badge, Table, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { TournamentMinimal } from '../../interfaces/tournament';
import { deletePlayer } from '../../services/player';
import DeleteButton from '../buttons/delete';
import { PlayerScore } from '../info/player_score';
import { WinDistribution } from '../info/player_statistics';
import PlayerUpdateModal from '../modals/player_update_modal';
import { DateTime } from '../utils/datetime';
import { EmptyTableInfo } from '../utils/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export function WinDistributionTitle() {
  const { t } = useTranslation();
  return (
    <>
      <Text span color="teal" inherit>
        {t('win_distribution_text_win')}
      </Text>{' '}
      /{' '}
      <Text span color="orange" inherit>
        {t('win_distribution_text_draws')}
      </Text>{' '}
      /{' '}
      <Text span color="red" inherit>
        {t('win_distribution_text_losses')}
      </Text>
    </>
  );
}

export default function PlayersTable({
  swrPlayersResponse,
  tournamentData,
}: {
  swrPlayersResponse: SWRResponse;
  tournamentData: TournamentMinimal;
}) {
  const { t } = useTranslation();
  const players: Player[] = swrPlayersResponse.data != null ? swrPlayersResponse.data.data : [];
  const tableState = getTableState('name');

  const minELOScore = Math.min(...players.map((player) => player.elo_score));
  const maxELOScore = Math.max(...players.map((player) => player.elo_score));
  const maxSwissScore = Math.max(...players.map((player) => player.swiss_score));

  if (swrPlayersResponse.error) return <RequestErrorAlert error={swrPlayersResponse.error} />;

  const rows = players
    .sort((p1: Player, p2: Player) => sortTableEntries(p1, p2, tableState))
    .map((player) => (
      <Table.Tr key={player.id}>
        <Table.Td>
          {player.active ? (
            <Badge color="green">Active</Badge>
          ) : (
            <Badge color="red">Inactive</Badge>
          )}
        </Table.Td>
        <Table.Td>
          <Text>{player.name}</Text>
        </Table.Td>
        <Table.Td>
          <DateTime datetime={player.created} />
        </Table.Td>
        <Table.Td>
          <WinDistribution wins={player.wins} draws={player.draws} losses={player.losses} />
        </Table.Td>
        <Table.Td>
          <PlayerScore
            score={player.elo_score}
            min_score={minELOScore}
            max_score={maxELOScore}
            decimals={0}
          />
        </Table.Td>
        <Table.Td>
          <PlayerScore
            score={player.swiss_score}
            min_score={0}
            max_score={maxSwissScore}
            decimals={1}
          />
        </Table.Td>
        <Table.Td>
          <PlayerUpdateModal
            swrPlayersResponse={swrPlayersResponse}
            tournament_id={tournamentData.id}
            player={player}
          />
          <DeleteButton
            onClick={async () => {
              await deletePlayer(tournamentData.id, player.id);
              await swrPlayersResponse.mutate(null);
            }}
            title={t('delete_player_button')}
          />
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name={t('players_title')} />;

  return (
    <TableLayout miw={900}>
      <Table.Thead>
        <Table.Tr>
          <ThSortable state={tableState} field="active">
            {t('status')}
          </ThSortable>
          <ThSortable state={tableState} field="name">
            {t('title')}
          </ThSortable>
          <ThSortable state={tableState} field="created">
            {t('created')}
          </ThSortable>
          <ThNotSortable>
            <>
              <WinDistributionTitle />
            </>
          </ThNotSortable>
          <ThSortable state={tableState} field="elo_score">
            {t('elo_score')}
          </ThSortable>
          <ThSortable state={tableState} field="swiss_score">
            {t('swiss_score')}
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </TableLayout>
  );
}
