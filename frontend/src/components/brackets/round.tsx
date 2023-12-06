import { Center, Grid, Title } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { BracketDisplaySettings } from '../../interfaces/brackets';
import {
  MatchInterface,
  isMatchHappening,
  isMatchInTheFutureOrPresent,
} from '../../interfaces/match';
import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import RoundModal from '../modals/round_modal';
import Match from './match';

export default function Round({
  tournamentData,
  round,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
  dynamicSchedule,
  displaySettings,
}: {
  tournamentData: TournamentMinimal;
  round: RoundInterface;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  readOnly: boolean;
  dynamicSchedule: boolean;
  displaySettings: BracketDisplaySettings;
}) {
  const matches = round.matches
    .sort((m1, m2) =>
      (m1.court ? m1.court.name : 'y') > (m2.court ? m2.court.name : 'z') ? 1 : -1
    )
    .filter(
      (match: MatchInterface) =>
        displaySettings.matchVisibility === 'all' ||
        (displaySettings.matchVisibility === 'future-only' && isMatchInTheFutureOrPresent(match)) ||
        (displaySettings.matchVisibility === 'present-only' && isMatchHappening(match))
    )
    .map((match) => (
      <Match
        key={match.id}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        match={match}
        readOnly={readOnly}
        dynamicSchedule={dynamicSchedule}
        displaySettings={displaySettings}
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
      swrRoundsResponse={swrStagesResponse}
      swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
      dynamicSchedule={dynamicSchedule}
    />
  );

  if (matches.length < 1 && displaySettings.matchVisibility !== 'all') {
    return null;
  }

  const item = (
    <div
      style={{
        height: '100%',
        minHeight: 320,
        padding: '15px',
        borderRadius: '20px',
        ...active_round_style,
      }}
    >
      <Center>{modal}</Center>
      {matches}
    </div>
  );

  if (readOnly) {
    return (
      <Grid.Col
        style={{ minHeight: 320, maxWidth: 500, marginRight: '1rem', marginBottom: '1rem' }}
      >
        {item}
      </Grid.Col>
    );
  }

  return (
    <div style={{ minHeight: 320, width: 400, marginRight: '1rem', marginBottom: '1rem' }}>
      {item}
    </div>
  );
}
