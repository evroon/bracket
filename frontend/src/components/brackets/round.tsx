import { Center } from '@mantine/core';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { Tournament } from '../../interfaces/tournament';
import RoundModal from '../modals/round_modal';
import Game from './game';

export default function Round({
  tournamentData,
  round,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
}: {
  tournamentData: Tournament;
  round: RoundInterface;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
}) {
  const games = round.matches.map((match) => (
    <Game
      key={match.id}
      tournamentData={tournamentData}
      swrRoundsResponse={swrRoundsResponse}
      swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
      match={match}
    />
  ));
  const active_round_style = round.is_active
    ? {
        borderStyle: 'solid',
        borderColor: 'green',
      }
    : round.is_draft
    ? {
        borderStyle: 'dashed',
        borderColor: 'gray',
      }
    : { borderStyle: 'hidden' };

  return (
    <div style={{ width: 300, marginLeft: '50px', minHeight: 500 }}>
      <div
        style={{
          height: '100%',
          minHeight: 500,
          padding: '15px',
          borderRadius: '20px',
          ...active_round_style,
        }}
      >
        <Center>
          <RoundModal
            tournamentData={tournamentData}
            round={round}
            swrRoundsResponse={swrRoundsResponse}
            swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          />
        </Center>
        {games}
      </div>
    </div>
  );
}
