import { Table } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { Club } from '../../interfaces/club';
import { deleteClub } from '../../services/club';
import DeleteButton from '../buttons/delete';
import ClubModal from '../modals/club_modal';
import { EmptyTableInfo } from '../utils/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function ClubsTable({ swrClubsResponse }: { swrClubsResponse: SWRResponse }) {
  const clubs: Club[] = swrClubsResponse.data != null ? swrClubsResponse.data.data : [];
  const tableState = getTableState('name');

  if (swrClubsResponse.error) return <RequestErrorAlert error={swrClubsResponse.error} />;

  const rows = clubs
    .sort((p1: Club, p2: Club) => sortTableEntries(p1, p2, tableState))
    .map((club) => (
      <Table.Tr key={club.id}>
        <Table.Td>{club.name}</Table.Td>
        <Table.Td>
          <ClubModal swrClubsResponse={swrClubsResponse} club={club} />
          <DeleteButton
            onClick={async () => {
              await deleteClub(club.id);
              await swrClubsResponse.mutate(null);
            }}
            title="Delete Club"
          />
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name="clubs" />;

  return (
    <TableLayout>
      <Table.Thead>
        <Table.Tr>
          <ThSortable state={tableState} field="name">
            Title
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </TableLayout>
  );
}
