import { GoCheck } from '@react-icons/all-files/go/GoCheck';
import { GoCircleSlash } from '@react-icons/all-files/go/GoCircleSlash';
import React from 'react';
import { SWRResponse } from 'swr';

import { Team } from '../../interfaces/team';
import { Tournament } from '../../interfaces/tournament';
import { deleteTeam } from '../../services/team';
import DeleteButton from '../buttons/delete';
import PlayerList from '../info/player_list';
import TeamModal from '../modals/team_modal';
import DateTime from '../utils/datetime';
import ErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, ThSortable, getTableState, sortTableEntries } from './table';

export default function TeamsTable({
  tournamentData,
  swrTeamsResponse,
}: {
  tournamentData: Tournament;
  swrTeamsResponse: SWRResponse;
}) {
  const teams: Team[] = swrTeamsResponse.data != null ? swrTeamsResponse.data.data : [];
  const tableState = getTableState('name');

  if (swrTeamsResponse.error) return ErrorAlert(swrTeamsResponse.error);

  const rows = teams
    .sort((p1: Team, p2: Team) => sortTableEntries(p1, p2, tableState))
    .map((team) => (
      <tr key={team.name}>
        <td>{team.active ? <GoCheck size="24px" /> : <GoCircleSlash size="24px" />}</td>
        <td>{team.name}</td>
        <td>
          <PlayerList team={team} />
        </td>
        <td>
          <DateTime datetime={team.created} />
        </td>
        <td>
          <TeamModal
            tournament_id={tournamentData.id}
            team={team}
            swrTeamsResponse={swrTeamsResponse}
          />
          <DeleteButton
            onClick={async () => {
              await deleteTeam(tournamentData.id, team.id);
              await swrTeamsResponse.mutate(null);
            }}
            title="Delete Team"
          />
        </td>
      </tr>
    ));

  return (
    <TableLayout>
      <thead>
        <tr>
          <ThSortable state={tableState} field="active">
            Active?
          </ThSortable>
          <ThSortable state={tableState} field="name">
            Name
          </ThSortable>
          <ThNotSortable>Members</ThNotSortable>
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
