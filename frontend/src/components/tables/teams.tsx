import { Badge, Center, Pagination, Table } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import DeleteButton from '@components/buttons/delete';
import PlayerList from '@components/info/player_list';
import TeamUpdateModal from '@components/modals/team_update_modal';
import { NoContent } from '@components/no_content/empty_table_info';
import { DateTime } from '@components/utils/datetime';
import RequestErrorAlert from '@components/utils/error_alert';
import { TableSkeletonSingleColumn } from '@components/utils/skeletons';
import { TournamentMinimal } from '@components/utils/tournament';
import { FullTeamWithPlayers, TeamsWithPlayersResponse } from '@openapi';
import { deleteTeam } from '@services/team';
import TableLayout, { TableState, ThNotSortable, ThSortable, sortTableEntries } from './table';

export default function TeamsTable({
  tournamentData,
  swrTeamsResponse,
  teams,
  tableState,
  teamCount,
}: {
  tournamentData: TournamentMinimal;
  swrTeamsResponse: SWRResponse<TeamsWithPlayersResponse>;
  teams: FullTeamWithPlayers[];
  tableState: TableState;
  teamCount: number;
}) {
  const { t } = useTranslation();
  if (swrTeamsResponse.error) return <RequestErrorAlert error={swrTeamsResponse.error} />;

  if (swrTeamsResponse.isLoading) {
    return <TableSkeletonSingleColumn />;
  }

  const rows = teams
    .sort((p1: FullTeamWithPlayers, p2: FullTeamWithPlayers) =>
      sortTableEntries(p1, p2, tableState)
    )
    .map((team) => (
      <Table.Tr key={team.id}>
        <Table.Td>
          {team.active ? (
            <Badge color="green">{t('active')}</Badge>
          ) : (
            <Badge color="red">{t('inactive')}</Badge>
          )}
        </Table.Td>
        <Table.Td>{team.name}</Table.Td>
        <Table.Td>
          <PlayerList team={team} />
        </Table.Td>
        <Table.Td>
          <DateTime datetime={team.created} />
        </Table.Td>
        <Table.Td>
          <TeamUpdateModal
            tournament_id={tournamentData.id}
            team={team}
            swrTeamsResponse={swrTeamsResponse}
          />
          <DeleteButton
            onClick={async () => {
              await deleteTeam(tournamentData.id, team.id);
              await swrTeamsResponse.mutate();
            }}
            title={t('delete_team_button')}
          />
        </Table.Td>
      </Table.Tr>
    ));

  if (rows.length < 1) return <NoContent title={t('no_teams_title')} />;

  return (
    <>
      <TableLayout miw={850}>
        <Table.Thead>
          <Table.Tr>
            <ThSortable state={tableState} field="active">
              {t('status')}
            </ThSortable>
            <ThSortable state={tableState} field="name">
              {t('name_table_header')}
            </ThSortable>
            <ThNotSortable>{t('members_table_header')}</ThNotSortable>
            <ThSortable state={tableState} field="created">
              {t('created')}
            </ThSortable>
            <ThNotSortable>{null}</ThNotSortable>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </TableLayout>

      <Center mt="1rem">
        <Pagination
          value={tableState.page}
          onChange={tableState.setPage}
          total={1 + teamCount / tableState.pageSize}
          size="lg"
        />
      </Center>
    </>
  );
}
