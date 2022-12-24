import { SWRResponse } from 'swr';

import UpcomingMatchesTable from '../tables/upcoming_matches';

export default function Scheduler({
  swrUpcomingMatchesResponse,
}: {
  swrUpcomingMatchesResponse: SWRResponse;
}) {
  return (
    <>
      <h4>Schedule new matches</h4>
      <UpcomingMatchesTable swrUpcomingMatchesResponse={swrUpcomingMatchesResponse} />
    </>
  );
}
