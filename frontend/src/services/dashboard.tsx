import React from 'react';

import { TableSkeletonTwoColumns } from '@components/utils/skeletons';
import { getTournamentEndpointFromRouter } from '@components/utils/util';
import { Tournament } from '@openapi';
import DashboardNotFoundTitle from '@pages/tournaments/[id]/dashboard/dashboard_404';
import GenericErrorPage from '@pages/tournaments/[id]/dashboard/generic_dashboard_error';
import { getTournamentByEndpointName } from './adapter';

export function getTournamentResponseByEndpointName(): Tournament | React.ReactElement {
  const endpointName = getTournamentEndpointFromRouter();
  const swrTournamentsResponse = getTournamentByEndpointName(endpointName);

  if (swrTournamentsResponse.isLoading) return <TableSkeletonTwoColumns />;
  if (swrTournamentsResponse.error) {
    if (swrTournamentsResponse.error.response.status == 404) return <DashboardNotFoundTitle />;
    return <GenericErrorPage />;
  }

  const data = swrTournamentsResponse.data?.data;
  return (data == null ? null : data[0]) || <DashboardNotFoundTitle />;
}
