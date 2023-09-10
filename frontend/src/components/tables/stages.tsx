import React from 'react';
import { SWRResponse } from 'swr';

import { StageWithRounds } from '../../interfaces/stage';
import { Tournament } from '../../interfaces/tournament';
import { deleteStage } from '../../services/stage';
import DeleteButton from '../buttons/delete';
import { EmptyTableInfo } from '../utils/empty_table_info';
import RequestErrorAlert from '../utils/error_alert';
import TableLayout, { ThNotSortable, getTableState, sortTableEntries } from './table';

export default function StagesTable({
  tournament,
  swrStagesResponse,
}: {
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
}) {
  const stages: StageWithRounds[] =
    swrStagesResponse.data != null ? swrStagesResponse.data.data : [];
  const tableState = getTableState('id');

  if (swrStagesResponse.error) return <RequestErrorAlert error={swrStagesResponse.error} />;

  const rows = stages
    .sort((s1: StageWithRounds, s2: StageWithRounds) => sortTableEntries(s1, s2, tableState))
    .map((stage) => (
      <tr key={stage.type_name}>
        <td>{stage.type_name}</td>
        <td>{stage.status}</td>
        <td>
          <DeleteButton
            onClick={async () => {
              await deleteStage(tournament.id, stage.id);
              await swrStagesResponse.mutate(null);
            }}
            title="Delete Stage"
          />
        </td>
      </tr>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name="stages" />;

  return (
    <TableLayout>
      <thead>
        <tr>
          <ThNotSortable>Title</ThNotSortable>
          <ThNotSortable>Status</ThNotSortable>
          <ThNotSortable>{null}</ThNotSortable>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </TableLayout>
  );
}
