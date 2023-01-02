import { Button } from '@mantine/core';
import { IconCalendarPlus } from '@tabler/icons';
import React from 'react';
import { SWRResponse } from 'swr';

import { MatchCreateBodyInterface, UpcomingMatchInterface } from '../../interfaces/match';
import { Tournament } from '../../interfaces/tournament';
import { createMatch } from '../../services/match';
import PlayerList from '../info/player_list';
import ErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function UpcomingMatchesTable({
  round_id,
  tournamentData,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
}: {
  round_id: number;
  tournamentData: Tournament;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
}) {
  const upcoming_matches: UpcomingMatchInterface[] =
    swrUpcomingMatchesResponse.data != null ? swrUpcomingMatchesResponse.data.data : [];
  const tableState = getTableState('elo_diff');

  if (swrUpcomingMatchesResponse.error) return ErrorAlert(swrUpcomingMatchesResponse.error);

  async function scheduleMatch(upcoming_match: UpcomingMatchInterface) {
    const match_to_schedule: MatchCreateBodyInterface = {
      team1_id: upcoming_match.team1.id,
      team2_id: upcoming_match.team2.id,
      round_id,
    };
    await createMatch(tournamentData.id, match_to_schedule);
    await swrRoundsResponse.mutate(null);
    await swrUpcomingMatchesResponse.mutate(null);
  }

  const rows = upcoming_matches
    .sort((m1: UpcomingMatchInterface, m2: UpcomingMatchInterface) =>
      sortTableEntries(m1, m2, tableState)
    )
    .map((upcoming_match: UpcomingMatchInterface) => (
      <tr key={upcoming_match.elo_diff}>
        <td>
          <PlayerList team={upcoming_match.team1} />
        </td>
        <td>
          <PlayerList team={upcoming_match.team2} />
        </td>
        <td>{upcoming_match.elo_diff}</td>
        <td>{upcoming_match.swiss_diff}</td>
        <td>
          <Button
            color="green"
            size="xs"
            style={{ marginRight: 10 }}
            onClick={() => scheduleMatch(upcoming_match)}
            leftIcon={<IconCalendarPlus size={20} />}
          >
            Schedule
          </Button>
        </td>
      </tr>
    ));

  return (
    <TableLayout>
      <thead>
        <tr>
          <ThSortable state={tableState} field="name">
            Team 1
          </ThSortable>
          <ThSortable state={tableState} field="name">
            Team 2
          </ThSortable>
          <ThSortable state={tableState} field="elo_diff">
            ELO Difference
          </ThSortable>
          <ThSortable state={tableState} field="swiss_diff">
            Swiss Difference
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayout>
  );
}
