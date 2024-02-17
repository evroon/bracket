import { Button, Table } from '@mantine/core';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { SWRResponse } from 'swr';

import { Tournament } from '../../interfaces/tournament';
import { deleteTournament } from '../../services/tournament';
import DeleteButton from '../buttons/delete';
import { EmptyTableInfo } from '../no_content/empty_table_info';
import { DateTime } from '../utils/datetime';
import RequestErrorAlert from '../utils/error_alert';
import { TableSkeletonSingleColumn } from '../utils/skeletons';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function TournamentsTable({
  swrTournamentsResponse,
}: {
  swrTournamentsResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const tableState = getTableState('name');

  if (swrTournamentsResponse.error) {
    return <RequestErrorAlert error={swrTournamentsResponse.error} />;
  }
  if (swrTournamentsResponse.isLoading) {
    return <TableSkeletonSingleColumn />;
  }

  const tournaments: Tournament[] =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : [];

  const rows = tournaments
    .sort((p1: Tournament, p2: Tournament) => sortTableEntries(p1, p2, tableState))
    .map((tournament) => (
      <Table.Tr key={tournament.id}>
        <Table.Td>
          <Link href={`/tournaments/${tournament.id}`}>{tournament.name}</Link>
        </Table.Td>
        <Table.Td>
          <DateTime datetime={tournament.created} />
        </Table.Td>
        <Table.Td>
          <Button
            color="green"
            size="xs"
            style={{ marginRight: 10 }}
            onClick={() => router.push(`/tournaments/${tournament.id}/settings`)}
            leftSection={<BiEditAlt size={20} />}
          >
            {t('edit_tournament_button')}
          </Button>
          <DeleteButton
            onClick={async () => {
              await deleteTournament(tournament.id);
              await swrTournamentsResponse.mutate();
            }}
            title={t('delete_tournament_button')}
          />
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name={t('tournaments_title')} />;

  return (
    <TableLayout miw={550}>
      <Table.Thead>
        <Table.Tr>
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
  );
}
