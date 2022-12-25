import { Group } from '@mantine/core';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { Tournament } from '../../interfaces/tournament';
import { getUpcomingMatches } from '../../services/adapter';
import Scheduler from '../scheduling/scheduler';
import Round from './round';

export default function Brackets({
  tournamentData,
  swrRoundsResponse,
}: {
  tournamentData: Tournament;
  swrRoundsResponse: SWRResponse;
}) {
  if (swrRoundsResponse.data == null) {
    return <div />;
  }

  const rounds = swrRoundsResponse.data.data.map((round: RoundInterface) => (
    <Round
      key={round.id}
      tournamentData={tournamentData}
      round={round}
      swrRoundsResponse={swrRoundsResponse}
    />
  ));

  const swrUpcomingMatchesResponse: SWRResponse = getUpcomingMatches(tournamentData.id);

  return (
    <div style={{ marginTop: '15px' }}>
      <Group>{rounds}</Group>
      <h2>Settings</h2>
      <Scheduler swrUpcomingMatchesResponse={swrUpcomingMatchesResponse} />
    </div>
  );
}
