import { Center, Title } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import RoundModal from '../modals/round_modal';
import Match from './match';

export default function Round({
  tournamentData,
  round,
  swrRoundsResponse,
  swrCourtsResponse,
  swrUpcomingMatchesResponse,
  readOnly,
}: {
  tournamentData: TournamentMinimal;
  round: RoundInterface;
  swrRoundsResponse: SWRResponse;
  swrCourtsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  readOnly: boolean;
}) {
  const matches = round.matches
    .sort((m1, m2) => ((m1.court_id ? m1.court_id : -1) > (m2.court_id ? m2.court_id : -2) ? 1 : 0))
    .map((match) => (
      <Match
        key={match.id}
        tournamentData={tournamentData}
        swrRoundsResponse={swrRoundsResponse}
        swrCourtsResponse={swrCourtsResponse}
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
    <div style={{ minHeight: 500 }}>
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
        {matches}
      </div>
    </div>
  );
}
