import { SWRResponse } from 'swr';

import { Tournament } from '../../interfaces/tournament';
import UpcomingMatchesTable from '../tables/upcoming_matches';

export default function Scheduler({
  tournamentData,
  round_id,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
}: {
  round_id: number;
  tournamentData: Tournament;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
}) {
  return (
    <>
      <h4>Schedule new matches</h4>
      <UpcomingMatchesTable
        round_id={round_id}
        tournamentData={tournamentData}
        swrRoundsResponse={swrRoundsResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
      />
    </>
  );
}
