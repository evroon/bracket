import { Grid } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import { getStages } from '../../services/adapter';
import MatchLarge from './match_large';

function getRoundsGridCols(
  swrStagesResponse: SWRResponse,
  activeRound: RoundInterface,
  tournamentData: TournamentMinimal
) {
  return activeRound.matches
    .sort((m1, m2) => ((m1.court ? m1.court.name : 'y') > (m2.court ? m2.court.name : 'z') ? 1 : 0))
    .map((match) => (
      <Grid.Col sm={6} lg={6} xl={6} key={match.id}>
        <MatchLarge
          key={match.id}
          tournamentData={tournamentData}
          swrStagesResponse={swrStagesResponse}
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
  const swrStagesResponse = getStages(tournamentData.id);
  return (
    <div>
      <Grid>{getRoundsGridCols(swrStagesResponse, activeRound, tournamentData)}</Grid>
    </div>
  );
}
