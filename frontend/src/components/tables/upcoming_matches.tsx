import { Badge, Button, Table } from '@mantine/core';
import { IconCalendarPlus, IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { BracketDisplaySettings } from '../../interfaces/brackets';
import { MatchCreateBodyInterface, UpcomingMatchInterface } from '../../interfaces/match';
import { Tournament } from '../../interfaces/tournament';
import { createMatch } from '../../services/match';
import PlayerList from '../info/player_list';
import { EmptyTableInfo } from '../no_content/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

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
  const { t } = useTranslation();
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
    await swrRoundsResponse.mutate();
    await swrUpcomingMatchesResponse.mutate();
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
              {t('recommended_badge_title')}
            </Badge>
          ) : null}
        </td>
        <td>
          <PlayerList team={upcoming_match.team1} displaySettings={displaySettings} />
        </td>
        <td>
          <PlayerList team={upcoming_match.team2} displaySettings={displaySettings} />
        </td>
        <td>{upcoming_match.elo_diff.toFixed(0)}</td>
        <td>{upcoming_match.swiss_diff.toFixed(1)}</td>
        <td>
          <Button
            color="green"
            size="xs"
            style={{ marginRight: 10 }}
            onClick={() => scheduleMatch(upcoming_match)}
            leftSection={<IconCalendarPlus size={20} />}
          >
            {t('schedule_title')}
          </Button>
        </td>
      </tr>
    ));

  if (rows.length < 1) {
    return <EmptyTableInfo entity_name={t('upcoming_matches_empty_table_info')} />;
  }

  return (
    <TableLayout miw={850}>
      <Table.Thead>
        <Table.Tr>
          <ThSortable state={tableState} field="is_recommended">
            {t('recommended_badge_title')}
          </ThSortable>
          <ThSortable state={tableState} field="team1.name">
            {t('team_title')} 1
          </ThSortable>
          <ThSortable state={tableState} field="team2.name">
            {t('team_title')} 2
          </ThSortable>
          <ThSortable state={tableState} field="elo_diff">
            {t('elo_difference')}
          </ThSortable>
          <ThSortable state={tableState} field="swiss_diff">
            {t('swiss_difference')}
          </ThSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </TableLayout>
  );
}
