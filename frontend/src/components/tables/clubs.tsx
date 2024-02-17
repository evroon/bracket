import { Table } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { Club } from '../../interfaces/club';
import { deleteClub } from '../../services/club';
import DeleteButton from '../buttons/delete';
import ClubModal from '../modals/club_modal';
import { EmptyTableInfo } from '../no_content/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import { TableSkeletonSingleColumn } from '../utils/skeletons';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function ClubsTable({ swrClubsResponse }: { swrClubsResponse: SWRResponse }) {
  const clubs: Club[] = swrClubsResponse.data != null ? swrClubsResponse.data.data : [];
  const tableState = getTableState('name');
  const { t } = useTranslation();

  if (swrClubsResponse.error) return <RequestErrorAlert error={swrClubsResponse.error} />;
  if (swrClubsResponse.isLoading) {
    return <TableSkeletonSingleColumn />;
  }

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
              await swrClubsResponse.mutate();
            }}
            title={t('delete_club_button')}
          />
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name={t('clubs_title')} />;

  return (
    <TableLayout>
      <Table.Thead>
        <Table.Tr>
          <ThSortable state={tableState} field="name">
            {t('title')}
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </TableLayout>
  );
}
