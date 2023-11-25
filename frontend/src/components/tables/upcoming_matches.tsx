import { Badge, Button } from '@mantine/core';
import { IconCalendarPlus, IconCheck } from '@tabler/icons-react';
import React from 'react';
import { SWRResponse } from 'swr';

import { BracketDisplaySettings } from '../../interfaces/brackets';
import { MatchCreateBodyInterface, UpcomingMatchInterface } from '../../interfaces/match';
import { TeamInterface } from '../../interfaces/team';
import { Tournament } from '../../interfaces/tournament';
import { createMatch } from '../../services/match';
import PlayerList from '../info/player_list';
import { EmptyTableInfo } from '../utils/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

function getPlayerIds(team: TeamInterface) {
  return team.players.map((p) => p.id.toString());
}

export default function UpcomingMatchesTable({
  round_id,
  tournamentData,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  displaySettings,
}: {
  round_id: number;
  tournamentData: Tournament;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  displaySettings: BracketDisplaySettings;
}) {
  const upcoming_matches: UpcomingMatchInterface[] =
    swrUpcomingMatchesResponse.data != null ? swrUpcomingMatchesResponse.data.data : [];
  const tableState = getTableState('elo_diff');

  if (round_id == null) {
    return null;
  }

  if (swrUpcomingMatchesResponse.error) {
    return <RequestErrorAlert error={swrUpcomingMatchesResponse.error} />;
  }

  async function scheduleMatch(upcoming_match: UpcomingMatchInterface) {
    if (upcoming_match.team1.id != null && upcoming_match.team2.id != null) {
      const match_to_schedule: MatchCreateBodyInterface = {
        team1_id: upcoming_match.team1.id,
        team2_id: upcoming_match.team2.id,
        round_id,
        label: '',
      };

      await createMatch(tournamentData.id, match_to_schedule);
    }
    await swrRoundsResponse.mutate(null);
    await swrUpcomingMatchesResponse.mutate(null);
  }

  const rows = upcoming_matches
    .sort((m1: UpcomingMatchInterface, m2: UpcomingMatchInterface) =>
      sortTableEntries(m1, m2, tableState)
    )
    .map((upcoming_match: UpcomingMatchInterface) => (
      <tr key={`${upcoming_match.team1.id} - ${upcoming_match.team2.id}`}>
        <td>
          {upcoming_match.is_recommended ? (
            <Badge leftSection={<IconCheck size={18} />} color="blue">
              Recommended
            </Badge>
          ) : null}
        </td>
        <td>
          {upcoming_match.team1.name}
        </td>
        <td>
          {upcoming_match.team2.name}
        </td>
        <td>{upcoming_match.elo_diff.toFixed(0)}</td>
        <td>{upcoming_match.swiss_diff.toFixed(1)}</td>
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

  if (rows.length < 1) return <EmptyTableInfo entity_name="upcoming matches" />;

  return (
    <TableLayout>
      <thead>
        <tr>
          <ThSortable state={tableState} field="is_recommended">
            Recommended
          </ThSortable>
          <ThSortable state={tableState} field="team1.name">
            Team 1
          </ThSortable>
          <ThSortable state={tableState} field="team2.name">
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
