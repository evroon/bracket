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
  dynamicSchedule,
}: {
  tournamentData: TournamentMinimal;
  round: RoundInterface;
  swrRoundsResponse: SWRResponse;
  swrCourtsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  readOnly: boolean;
  dynamicSchedule: boolean;
}) {
  const matches = round.matches
    .sort((m1, m2) => ((m1.court ? m1.court.name : 'y') > (m2.court ? m2.court.name : 'z') ? 1 : 0))
    .map((match) => (
      <Match
        key={match.id}
        tournamentData={tournamentData}
        swrRoundsResponse={swrRoundsResponse}
        swrCourtsResponse={swrCourtsResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        match={match}
        readOnly={readOnly}
        dynamicSchedule={dynamicSchedule}
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
      dynamicSchedule={dynamicSchedule}
    />
  );

  return (
    <div style={{ minHeight: 300 }}>
      <div
        style={{
          height: '100%',
          minHeight: 300,
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
