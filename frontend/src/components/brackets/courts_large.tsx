import { Grid } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import { getStages } from '../../services/adapter';
import MatchLarge from './match_large';

function getRoundsGridCols(
  activeRound: RoundInterface,
) {
  return activeRound.matches
    .sort((m1, m2) => ((m1.court ? m1.court.name : 'y') > (m2.court ? m2.court.name : 'z') ? 1 : 0))
    .map((match) => (
      <Grid.Col sm={12} key={match.id}>
        <MatchLarge key={match.id} match={match} />
      </Grid.Col>
    ));
}

export default function CourtsLarge({
  tournamentData,
  activeRound,
}: {
  tournamentData: TournamentMinimal;
  activeRound: RoundInterface;
}) {
  return (
    <Grid>
      <Grid.Col sm={6}>
        <Grid>{getRoundsGridCols(activeRound)}</Grid>
      </Grid.Col>
      <Grid.Col sm={6}>
        <Grid>{getRoundsGridCols(activeRound)}</Grid>
      </Grid.Col>
    </Grid>
  );
}
