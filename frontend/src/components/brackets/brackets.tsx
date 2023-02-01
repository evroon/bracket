import { Grid, Skeleton } from '@mantine/core';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import Round from './round';

export default function Brackets({
  tournamentData,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  readOnly,
}: {
  tournamentData: TournamentMinimal;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  readOnly: boolean;
}) {
  if (!swrRoundsResponse.isLoading && swrRoundsResponse.data == null) {
    return <p>No rounds found</p>;
  }
  if (swrRoundsResponse.isLoading) {
    return (
      <Grid>
        <Grid.Col sm={6} lg={4} xl={3}>
          <Skeleton height={500} mb="xl" radius="xl" />
        </Grid.Col>
        <Grid.Col sm={6} lg={4} xl={3}>
          <Skeleton height={500} mb="xl" radius="xl" />
        </Grid.Col>
      </Grid>
    );
  }

  const rounds = swrRoundsResponse.data.data.sort((r1, r2) => (r1.name > r2.name ? 1 : 0)).map((round: RoundInterface) => (
    <Grid.Col sm={6} lg={4} xl={3} key={round.id}>
      <Round
        tournamentData={tournamentData}
        round={round}
        swrRoundsResponse={swrRoundsResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
      />
    </Grid.Col>
  ));

  return <Grid>{rounds}</Grid>;
}
