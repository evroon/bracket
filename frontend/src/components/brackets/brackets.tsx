import { Group } from '@mantine/core';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import Round from './round';

export default function Brackets({
  tournamentData,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  readOnly,
}: {
  tournamentData: TournamentMinimal;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  readOnly: boolean;
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
      swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
      readOnly={readOnly}
    />
  ));

  return <Group>{rounds}</Group>;
}
