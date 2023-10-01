import { Grid, Title } from '@mantine/core';
import React from 'react';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import Match from './match';

function getRoundsGridCols(activeRound: RoundInterface, tournamentData: TournamentMinimal) {
  return activeRound.matches
    .sort((m1, m2) => ((m1.court ? m1.court.name : 'y') > (m2.court ? m2.court.name : 'z') ? 1 : 0))
    .map((match) => (
      <Grid.Col sm={6} lg={4} xl={4} key={match.id}>
        <Match
          key={match.id}
          tournamentData={tournamentData}
          swrRoundsResponse={null}
          swrCourtsResponse={null}
          swrUpcomingMatchesResponse={null}
          match={match}
          readOnly
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
  return (
    <div>
      <Title>{activeRound.name}</Title>
      <Grid>{getRoundsGridCols(activeRound, tournamentData)}</Grid>
    </div>
  );
}
