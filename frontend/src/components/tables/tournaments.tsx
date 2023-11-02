import { Button } from '@mantine/core';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { SWRResponse } from 'swr';

import { Tournament } from '../../interfaces/tournament';
import { deleteTournament } from '../../services/tournament';
import DeleteButton from '../buttons/delete';
import DateTime from '../utils/datetime';
import { EmptyTableInfo } from '../utils/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function TournamentsTable({
  swrTournamentsResponse,
}: {
  swrTournamentsResponse: SWRResponse;
}) {
  const router = useRouter();
  const tableState = getTableState('name');

  if (swrTournamentsResponse.error) {
    return <RequestErrorAlert error={swrTournamentsResponse.error} />;
  }

  const tournaments: Tournament[] =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : [];

  const rows = tournaments
    .sort((p1: Tournament, p2: Tournament) => sortTableEntries(p1, p2, tableState))
    .map((tournament) => (
      <tr key={tournament.name}>
        <td>
          <Link href={`/tournaments/${tournament.id}`}>{tournament.name}</Link>
        </td>
        <td>
          <DateTime datetime={tournament.created} />
        </td>
        <td>
          <Button
            color="green"
            size="xs"
            style={{ marginRight: 10 }}
            onClick={() => router.push(`/tournaments/${tournament.id}/settings`)}
            leftIcon={<BiEditAlt size={20} />}
          >
            Edit Tournament
          </Button>
          <DeleteButton
            onClick={async () => {
              await deleteTournament(tournament.id);
              await swrTournamentsResponse.mutate(null);
            }}
            title="Delete Tournament"
          />
        </td>
      </tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name="tournaments" />;

  return (
    <TableLayout>
      <thead>
        <tr>
          <ThSortable state={tableState} field="name">
            Title
          </ThSortable>
          <ThSortable state={tableState} field="created">
            Created
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayout>
  );
}
