import React from 'react';
import { GoCheck } from '@react-icons/all-files/go/GoCheck';
import { GoCircleSlash } from '@react-icons/all-files/go/GoCircleSlash';
import { getTeams } from '../../services/adapter';
import TableLayout, { getTableState, sortTableEntries, Th } from './table';
import ErrorAlert from '../utils/error_alert';
import DateTime from '../utils/datetime';
import { deleteTeam } from '../../services/team';
import TeamModal from '../modals/team_modal';
import DeleteButton from '../buttons/delete';
import { Team } from '../../interfaces/team';

export default function TeamsTable({ tournament_id }: any) {
  const { data, error } = getTeams(tournament_id);
  const teams: Team[] = data != null ? data.data : [];
  const tableState = getTableState('name');

  if (error) return ErrorAlert(error);

  const rows = teams
    .sort((p1: Team, p2: Team) => sortTableEntries(p1, p2, tableState))
    .map((row) => (
      <tr key={row.name}>
        <td>{row.active ? <GoCheck size="24px" /> : <GoCircleSlash size="24px" />}</td>
        <td>{row.name}</td>
        <td>
          <DateTime datetime={row.created} />
        </td>
        <td>
          <TeamModal tournament_id={tournament_id} team={row} />
          <DeleteButton onClick={() => deleteTeam(tournament_id, row.id)} title="Delete Team" />
        </td>
      </tr>
    ));

  return (
    <TableLayout>
      <thead>
        <tr>
          <Th state={tableState} field="active">
            Active?
          </Th>
          <Th state={tableState} field="name">
            Name
          </Th>
          <Th state={tableState} field="created">
            Created
          </Th>
          <Th state={tableState} field="">
            {null}
          </Th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayout>
  );
}
