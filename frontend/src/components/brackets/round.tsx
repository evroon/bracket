import { Center, Title } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import RoundModal from '../modals/round_modal';
import Game from './game';

export default function Round({
  tournamentData,
  round,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  readOnly,
}: {
  tournamentData: TournamentMinimal;
  round: RoundInterface;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  readOnly: boolean;
}) {
  const games = round.matches.map((match) => (
    <Game
      key={match.id}
      tournamentData={tournamentData}
      swrRoundsResponse={swrRoundsResponse}
      swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
      match={match}
      readOnly={readOnly}
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
    : {
        borderStyle: 'solid',
        borderColor: 'gray',
      };

  const modal = readOnly ? (
    <Title order={3}>{round.name}</Title>
  ) : (
    <RoundModal
      tournamentData={tournamentData}
      round={round}
      swrRoundsResponse={swrRoundsResponse}
      swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
    />
  );

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
        <Center>{modal}</Center>
        {games}
      </div>
    </div>
  );
}
