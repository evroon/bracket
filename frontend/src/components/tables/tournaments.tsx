import React from 'react';
import { Anchor } from '@mantine/core';
import Link from 'next/link';
import { getTournaments } from '../../services/adapter';
import TableLayout, { getTableState, Th } from './table';
import ErrorAlert from '../error_alert';

export interface Tournament {
  id: number;
  name: string;
  created: string;
}

export default function TournamentsTable() {
  const { data, error } = getTournaments();
  const tournaments: Tournament[] = data != null ? data.data : [];
  const tableState = getTableState();

  if (error) return ErrorAlert(error);

  const rows = tournaments.map((row) => (
    <tr key={row.name}>
      <td>
        <Anchor lineClamp={1} size="sm">
          <Link href={`/tournaments/${row.id}`}>{row.name}</Link>
        </Anchor>
      </td>
      <td>{row.created}</td>
    </tr>
  ));

  return (
    <TableLayout>
      <thead>
        <tr>
          <Th state={tableState} field="title">
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
