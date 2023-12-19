import { Table } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { Court } from '../../interfaces/court';
import { Tournament } from '../../interfaces/tournament';
import { deleteCourt } from '../../services/court';
import DeleteButton from '../buttons/delete';
import { EmptyTableInfo } from '../utils/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, getTableState, sortTableEntries } from './table';

export default function CourtsTable({
  tournament,
  swrCourtsResponse,
}: {
  tournament: Tournament;
  swrCourtsResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const courts: Court[] = swrCourtsResponse.data != null ? swrCourtsResponse.data.data : [];
  const tableState = getTableState('id');

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
              await swrCourtsResponse.mutate(null);
            }}
            title={t('delete_court_button')}
          />
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name={t('clubs_title')} />;

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
