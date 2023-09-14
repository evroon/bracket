import { Grid } from '@mantine/core';
import React from 'react';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import MatchLarge from './match_large';

function getRoundsGridCols(activeRound: RoundInterface, tournamentData: TournamentMinimal) {
  return activeRound.matches
    .sort((m1, m2) => ((m1.court ? m1.court.name : 'y') > (m2.court ? m2.court.name : 'z') ? 1 : 0))
    .map((match) => (
      <Grid.Col sm={6} lg={6} xl={6} key={match.id}>
        <MatchLarge
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

export default function CourtsLarge({
  tournamentData,
  activeRound,
}: {
  tournamentData: TournamentMinimal;
  activeRound: RoundInterface;
}) {
  return (
    <div>
      <Grid>{getRoundsGridCols(activeRound, tournamentData)}</Grid>
    </div>
  );
}
