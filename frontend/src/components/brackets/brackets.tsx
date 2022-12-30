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
  const swrUpcomingMatchesResponse: SWRResponse = getUpcomingMatches(tournamentData.id);
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
    />
  ));

  const draft_round = swrRoundsResponse.data.data.filter((round: RoundInterface) => round.is_draft);
  const scheduler =
    draft_round.length > 0 ? (
      <>
        <h2>Settings</h2>
        <Scheduler
          round_id={draft_round[0].id}
          tournamentData={tournamentData}
          swrRoundsResponse={swrRoundsResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        />
      </>
    ) : (
      ''
    );

  return (
    <div style={{ marginTop: '15px' }}>
      <Group>{rounds}</Group>
      {scheduler}
    </div>
  );
}
