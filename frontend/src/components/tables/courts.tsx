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
  const courts: Court[] = swrCourtsResponse.data != null ? swrCourtsResponse.data.data : [];
  const tableState = getTableState('id');

  if (swrCourtsResponse.error) return <RequestErrorAlert error={swrCourtsResponse.error} />;

  const rows = courts
    .sort((s1: Court, s2: Court) => sortTableEntries(s1, s2, tableState))
    .map((court) => (
      <tr key={court.name}>
        <td>{court.name}</td>
        <td>
          <DeleteButton
            onClick={async () => {
              await deleteCourt(tournament.id, court.id);
              await swrCourtsResponse.mutate(null);
            }}
            title="Delete Court"
          />
        </td>
      </tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name="courts" />;

  return (
    <TableLayout>
      <thead>
        <tr>
          <ThNotSortable>Title</ThNotSortable>
          <ThNotSortable>Status</ThNotSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayout>
  );
}
