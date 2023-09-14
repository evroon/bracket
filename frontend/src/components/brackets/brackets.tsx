import { Alert, Container, Grid, Skeleton } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import { responseIsValid } from '../utils/util';
import Round from './round';

function getRoundsGridCols(
  stages_map: { [p: string]: any },
  selectedStageId: number,
  tournamentData: TournamentMinimal,
  swrStagesResponse: SWRResponse,
  swrCourtsResponse: SWRResponse,
  swrUpcomingMatchesResponse: SWRResponse | null,
  readOnly: boolean
) {
  return stages_map[selectedStageId].rounds
    .sort((r1: any, r2: any) => (r1.name > r2.name ? 1 : 0))
    .map((round: RoundInterface) => (
      <Grid.Col sm={6} lg={4} xl={3} key={round.id}>
        <Round
          tournamentData={tournamentData}
          round={round}
          swrRoundsResponse={swrStagesResponse}
          swrCourtsResponse={swrCourtsResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          readOnly={readOnly}
        />
      </Grid.Col>
    ));
}

function NoRoundsAlert({ readOnly }: { readOnly: boolean }) {
  if (readOnly) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="No rounds found" color="blue" radius="lg">
        Please wait for the organiser to add them.
      </Alert>
    );
  }
  return (
    <Alert icon={<IconAlertCircle size={16} />} title="No rounds found" color="blue" radius="lg">
      Add a round using the top right button.
    </Alert>
  );
}

function NotStartedAlert() {
  return (
    <Container>
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Tournament has not started yet"
        color="blue"
        radius="lg"
      >
        Please go to the next stage to start the tournament.
      </Alert>
    </Container>
  );
}

function LoadingSkeleton() {
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

export default function Brackets({
  tournamentData,
  swrStagesResponse,
  swrCourtsResponse,
  swrUpcomingMatchesResponse,
  readOnly,
  selectedStageId,
}: {
  tournamentData: TournamentMinimal;
  swrStagesResponse: SWRResponse;
  swrCourtsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  readOnly: boolean;
  selectedStageId: number | null;
}) {
  if (selectedStageId == null) {
    return <NotStartedAlert />;
  }
  if (
    selectedStageId == null ||
    (!swrStagesResponse.isLoading && !responseIsValid(swrStagesResponse))
  ) {
    return <NoRoundsAlert readOnly={readOnly} />;
  }

  if (swrStagesResponse.isLoading) {
    return <LoadingSkeleton />;
  }

  const stages_map = Object.fromEntries(
    swrStagesResponse.data.data.map((x: RoundInterface) => [x.id, x])
  );
  const rounds =
    stages_map[selectedStageId].rounds.length > 0 ? (
      getRoundsGridCols(
        stages_map,
        selectedStageId,
        tournamentData,
        swrStagesResponse,
        swrCourtsResponse,
        swrUpcomingMatchesResponse,
        readOnly
      )
    ) : (
      <Alert icon={<IconAlertCircle size={16} />} title="No rounds" color="blue" radius="lg">
        There are no rounds in this stage yet
      </Alert>
    );

  return (
    <div>
      <Grid>{rounds}</Grid>
    </div>
  );
}
