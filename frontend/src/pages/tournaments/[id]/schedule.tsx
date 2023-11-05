import { Badge, Card, Container, Grid, Group, Text } from '@mantine/core';
import React from 'react';
import { SWRResponse } from 'swr';

import { getTournamentIdFromRouter, responseIsValid } from '../../../components/utils/util';
import { Court } from '../../../interfaces/court';
import { MatchInterface, formatMatchTeam1, formatMatchTeam2 } from '../../../interfaces/match';
import { getCourts, getStages } from '../../../services/adapter';
import {
  getMatchLookup,
  getMatchLookupByCourt,
  getStageItemLookup,
} from '../../../services/lookups';
import TournamentLayout from '../_tournament_layout';

function ScheduleRow({
  match,
  stageItemsLookup,
  matchesLookup,
}: {
  match: MatchInterface;
  stageItemsLookup: any;
  matchesLookup: any;
}) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
      <Group position="apart">
        <Text weight={500}>
          {formatMatchTeam1(stageItemsLookup, matchesLookup, match)} -{' '}
          {formatMatchTeam2(stageItemsLookup, matchesLookup, match)}
        </Text>
        <Badge color="pink" variant="light">
          {match.id}
        </Badge>
      </Group>
    </Card>
  );
}

function ScheduleColumn({
  court,
  matches,
  stageItemsLookup,
  matchesLookup,
}: {
  court: Court;
  matches: MatchInterface[];
  stageItemsLookup: any;
  matchesLookup: any;
}) {
  const rows = matches.map((match: MatchInterface) => (
    <ScheduleRow
      stageItemsLookup={stageItemsLookup}
      matchesLookup={matchesLookup}
      match={match}
      key={match.id}
    />
  ));
  return (
    <Grid.Col mb="1rem" sm={6} lg={4} xl={4} key={-1}>
      <h4>{court.name}</h4>
      {rows}
    </Grid.Col>
  );
}

function Schedule({
  matchesByCourtId,
  stageItemsLookup,
  matchesLookup,
  swrCourtsResponse,
}: {
  matchesByCourtId: any;
  stageItemsLookup: any;
  matchesLookup: any;
  swrCourtsResponse: SWRResponse;
}) {
  const columns = swrCourtsResponse.data.data.map((court: Court) => (
    <ScheduleColumn
      stageItemsLookup={stageItemsLookup}
      matchesLookup={matchesLookup}
      key={court.id}
      court={court}
      matches={matchesByCourtId[court.id]}
    />
  ));
  return <Grid>{columns}</Grid>;
}

export default function SchedulePage() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrStagesResponse = getStages(tournamentData.id);

  const swrCourtsResponse = getCourts(tournamentData.id);
  if (!responseIsValid(swrStagesResponse)) return null;
  if (!responseIsValid(swrCourtsResponse)) return null;

  const stageItemsLookup = getStageItemLookup(swrStagesResponse);
  const matchesLookup = getMatchLookup(swrStagesResponse);
  const matchesByCourtId = getMatchLookupByCourt(swrStagesResponse);

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Container size="1600px">
        <Group grow mt="1rem">
          <Schedule
            swrCourtsResponse={swrCourtsResponse}
            matchesByCourtId={matchesByCourtId}
            stageItemsLookup={stageItemsLookup}
            matchesLookup={matchesLookup}
          />
        </Group>
      </Container>
    </TournamentLayout>
  );
}
