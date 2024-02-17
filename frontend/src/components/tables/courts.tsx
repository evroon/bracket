import { Table } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { Court } from '../../interfaces/court';
import { Tournament } from '../../interfaces/tournament';
import { deleteCourt } from '../../services/court';
import DeleteButton from '../buttons/delete';
import { EmptyTableInfo } from '../no_content/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import { TableSkeletonSingleColumn } from '../utils/skeletons';
import { Translator } from '../utils/types';
import TableLayout, { ThNotSortable, getTableState, sortTableEntries } from './table';

export default function CourtsTable({
  t,
  tournament,
  swrCourtsResponse,
}: {
  t: Translator;
  tournament: Tournament;
  swrCourtsResponse: SWRResponse;
}) {
  const courts: Court[] = swrCourtsResponse.data != null ? swrCourtsResponse.data.data : [];
  const tableState = getTableState('id');

  if (swrCourtsResponse.isLoading) {
    return <TableSkeletonSingleColumn />;
  }

  if (swrCourtsResponse.error) return <RequestErrorAlert error={swrCourtsResponse.error} />;

  const rows = courts
    .sort((s1: Court, s2: Court) => sortTableEntries(s1, s2, tableState))
    .map((court) => (
      <Table.Tr key={court.id}>
        <Table.Td>{court.name}</Table.Td>
        <Table.Td>
          <DeleteButton
            onClick={async () => {
              await deleteCourt(tournament.id, court.id);
              await swrCourtsResponse.mutate();
            }}
            title={t('delete_court_button')}
            style={{ float: 'right' }}
          />
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name={t('courts_title')} />;

  return (
    <TableLayout>
      <Table.Thead>
        <Table.Tr>
          <ThNotSortable>{t('title')}</ThNotSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </TableLayout>
  );
}
