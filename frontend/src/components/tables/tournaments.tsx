import React from 'react';
import { Anchor } from '@mantine/core';
import Link from 'next/link';
import { getTournaments } from '../../services/adapter';
import TableLayout, { getTableState, sortTableEntries, Th } from './table';
import ErrorAlert from '../utils/error_alert';
import DateTime from '../utils/datetime';
import { Tournament } from '../../interfaces/tournament';

export default function TournamentsTable() {
  const { data, error } = getTournaments();
  const tournaments: Tournament[] = data != null ? data.data : [];
  const tableState = getTableState('name');

  if (error) return ErrorAlert(error);

  const rows = tournaments
    .sort((p1: Tournament, p2: Tournament) => sortTableEntries(p1, p2, tableState))
    .map((row) => (
      <tr key={row.name}>
        <td>
          <Anchor lineClamp={1} size="sm">
            <Link href={`/tournaments/${row.id}`}>{row.name}</Link>
          </Anchor>
        </td>
        <td>
          <DateTime datetime={row.created} />
        </td>
      </tr>
    ));

  return (
    <TableLayout>
      <thead>
        <tr>
          <Th state={tableState} field="name">
            Title
          </Th>
          <Th state={tableState} field="created">
            Created
          </Th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayout>
  );
}
