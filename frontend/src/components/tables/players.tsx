import { Badge, Center, Pagination, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import DeleteButton from '@components/buttons/delete';
import PlayerUpdateModal from '@components/modals/player_update_modal';
import { NoContent } from '@components/no_content/empty_table_info';
import { DateTime } from '@components/utils/datetime';
import RequestErrorAlert from '@components/utils/error_alert';
import { TableSkeletonSingleColumn } from '@components/utils/skeletons';
import { TournamentMinimal } from '@components/utils/tournament';
import { Player, PlayersResponse } from '@openapi';
import { deletePlayer } from '@services/player';
import TableLayout, { TableState, ThNotSortable, ThSortable, sortTableEntries } from './table';

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
  tableState,
  playerCount,
}: {
  swrPlayersResponse: SWRResponse<PlayersResponse>;
  tournamentData: TournamentMinimal;
  tableState: TableState;
  playerCount: number;
}) {
  const { t } = useTranslation();
  const players: Player[] =
    swrPlayersResponse.data != null ? swrPlayersResponse.data.data.players : [];

  // const minELOScore = Math.min(...players.map((player) => Number(player.elo_score)));
  // const maxELOScore = Math.max(...players.map((player) => Number(player.elo_score)));
  // const maxSwissScore = Math.max(...players.map((player) => Number(player.swiss_score)));

  if (swrPlayersResponse.error) return <RequestErrorAlert error={swrPlayersResponse.error} />;

  if (swrPlayersResponse.isLoading) {
    return <TableSkeletonSingleColumn />;
  }

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
          <PlayerUpdateModal
            swrPlayersResponse={swrPlayersResponse}
            tournament_id={tournamentData.id}
            player={player}
          />
          <DeleteButton
            onClick={async () => {
              await deletePlayer(tournamentData.id, player.id);
              await swrPlayersResponse.mutate();
            }}
            title={t('delete_player_button')}
          />
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) return <NoContent title={t('no_players_title')} />;

  return (
    <>
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
            <ThNotSortable>{null}</ThNotSortable>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </TableLayout>
      <Center mt="1rem">
        <Pagination
          value={tableState.page}
          onChange={tableState.setPage}
          total={1 + playerCount / tableState.pageSize}
          size="lg"
        />
      </Center>
    </>
  );
}
