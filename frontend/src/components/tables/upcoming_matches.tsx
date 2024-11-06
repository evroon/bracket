import { Badge, Button, Center, Stack, Table } from '@mantine/core';
import { GoChecklist } from '@react-icons/all-files/go/GoChecklist';
import { IconCalendarPlus, IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FaCheck } from 'react-icons/fa6';
import { SWRResponse } from 'swr';

import { MatchCreateBodyInterface, UpcomingMatchInterface } from '../../interfaces/match';
import { RoundInterface } from '../../interfaces/round';
import { Tournament } from '../../interfaces/tournament';
import { createMatch } from '../../services/match';
import { updateRound } from '../../services/round';
import { NoContent } from '../no_content/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function UpcomingMatchesTable({
  draftRound,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
}: {
  draftRound: RoundInterface;
  tournamentData: Tournament;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const upcoming_matches: UpcomingMatchInterface[] =
    swrUpcomingMatchesResponse.data != null ? swrUpcomingMatchesResponse.data.data : [];
  const tableState = getTableState('elo_diff');

  if (draftRound == null) {
    return null;
  }

  if (swrUpcomingMatchesResponse.error) {
    return <RequestErrorAlert error={swrUpcomingMatchesResponse.error} />;
  }

  async function scheduleMatch(upcoming_match: UpcomingMatchInterface) {
    if (
      upcoming_match.stage_item_input1.id != null &&
      upcoming_match.stage_item_input2.id != null
    ) {
      const match_to_schedule: MatchCreateBodyInterface = {
        stage_item_input1_id: upcoming_match.stage_item_input1.id,
        stage_item_input2_id: upcoming_match.stage_item_input2.id,
        round_id: draftRound.id,
        label: '',
      };

      await createMatch(tournamentData.id, match_to_schedule);
    }
    await swrStagesResponse.mutate();
    await swrUpcomingMatchesResponse.mutate();
  }

  const rows = upcoming_matches
    .sort((m1: UpcomingMatchInterface, m2: UpcomingMatchInterface) =>
      sortTableEntries(m1, m2, tableState)
    )
    .map((upcoming_match: UpcomingMatchInterface) => (
      <Table.Tr
        key={`${upcoming_match.stage_item_input1.id} - ${upcoming_match.stage_item_input2.id}`}
      >
        <Table.Td>
          {upcoming_match.is_recommended ? (
            <Badge leftSection={<IconCheck size={18} />} color="blue">
              {t('recommended_badge_title')}
            </Badge>
          ) : null}
        </Table.Td>
        <Table.Td>{upcoming_match.stage_item_input1.team?.name}</Table.Td>
        <Table.Td>{upcoming_match.stage_item_input2.team?.name}</Table.Td>
        <Table.Td>{Number(upcoming_match.elo_diff).toFixed(0)}</Table.Td>
        <Table.Td>{Number(upcoming_match.swiss_diff).toFixed(1)}</Table.Td>
        <Table.Td>
          <Button
            color="green"
            size="xs"
            style={{ marginRight: 10 }}
            onClick={async () => scheduleMatch(upcoming_match)}
            leftSection={<IconCalendarPlus size={20} />}
          >
            {t('schedule_title')}
          </Button>
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) {
    return (
      <Stack>
        <NoContent
          title={t('no_more_matches_title')}
          description={`${t('all_matches_scheduled_description')}`}
          icon={<FaCheck />}
        />
        <Center>
          <Button
            color="green"
            size="lg"
            variant="outline"
            miw="20rem"
            leftSection={<GoChecklist size={20} />}
            onClick={async () => {
              await updateRound(tournamentData.id, draftRound.id, draftRound.name, false);
              await swrStagesResponse.mutate();
              await swrUpcomingMatchesResponse.mutate();
            }}
          >
            {t('mark_round_as_non_draft')}
          </Button>
        </Center>
      </Stack>
    );
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
