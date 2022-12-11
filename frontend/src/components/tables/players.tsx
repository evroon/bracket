import React from 'react';
import { Anchor } from '@mantine/core';
import Link from 'next/link';
import { getPlayers } from '../../services/adapter';
import TableLayout, { getTableState, Th } from './table';
import ErrorAlert from '../error_alert';

export interface Player {
  id: number;
  name: string;
  created: string;
}

export default function PlayersTable({ tournament_id }: any) {
  const { data, error } = getPlayers(tournament_id);
  const tournaments: Player[] = data != null ? data.data : [];
  const tableState = getTableState();

  if (error) return ErrorAlert(error);

  const rows = tournaments.map((row) => (
    <tr key={row.name}>
      <td>
        <Anchor lineClamp={1} size="sm">
          <Link href={`/tournaments/${tournament_id}/${row.id}`}>{row.name}</Link>
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
