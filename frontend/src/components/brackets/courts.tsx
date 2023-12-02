import { Grid, Title } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import { getStages } from '../../services/adapter';
import Match from './match';

function getRoundsGridCols(
  swrStagesResponse: SWRResponse,
  activeRound: RoundInterface,
  tournamentData: TournamentMinimal
) {
  return activeRound.matches
    .sort((m1, m2) =>
      (m1.court ? m1.court.name : 'y') > (m2.court ? m2.court.name : 'z') ? 1 : -1
    )
    .map((match) => (
      <Grid.Col span={{ sm: 6 }} key={match.id}>
        <Match
          key={match.id}
          tournamentData={tournamentData}
          swrStagesResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={null}
          match={match}
          readOnly
          dynamicSchedule={false}
        />
      </Grid.Col>
    ));
}

export default function Courts({
  tournamentData,
  activeRound,
}: {
  tournamentData: TournamentMinimal;
  activeRound: RoundInterface;
}) {
  const swrStagesResponse = getStages(tournamentData.id);
  return (
    <div>
      <Title>{activeRound.name}</Title>
      <Grid>{getRoundsGridCols(swrStagesResponse, activeRound, tournamentData)}</Grid>
    </div>
  );
}
