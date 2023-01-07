import { Anchor } from '@mantine/core';
import Link from 'next/link';
import React from 'react';
import { SWRResponse } from 'swr';

import { Tournament } from '../../interfaces/tournament';
import { deleteTournament } from '../../services/tournament';
import DeleteButton from '../buttons/delete';
import TournamentModal from '../modals/tournament_modal';
import DateTime from '../utils/datetime';
import RequestErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function TournamentsTable({
  swrTournamentsResponse,
}: {
  swrTournamentsResponse: SWRResponse;
}) {
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
          <Anchor lineClamp={1} size="sm">
            <Link href={`/tournaments/${tournament.id}`}>{tournament.name}</Link>
          </Anchor>
        </td>
        <td>
          <DateTime datetime={tournament.created} />
        </td>
        <td>
          <TournamentModal
            tournament={tournament}
            swrTournamentsResponse={swrTournamentsResponse}
            in_table
          />
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
