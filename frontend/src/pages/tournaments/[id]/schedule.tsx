import { Alert, Badge, Button, Card, Grid, Group, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconCalendarPlus } from '@tabler/icons-react';
import React from 'react';
// @ts-ignore
import EllipsisText from 'react-ellipsis-text';
import { SWRResponse } from 'swr';

import { Time } from '../../../components/utils/datetime';
import { getTournamentIdFromRouter, responseIsValid } from '../../../components/utils/util';
import { Court } from '../../../interfaces/court';
import { MatchInterface, formatMatchTeam1, formatMatchTeam2 } from '../../../interfaces/match';
import { getCourts, getStages } from '../../../services/adapter';
import {
  getMatchLookup,
  getMatchLookupByCourt,
  getStageItemLookup,
} from '../../../services/lookups';
import { scheduleMatches } from '../../../services/match';
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
  const matchName = `${formatMatchTeam1(
    stageItemsLookup,
    matchesLookup,
    match
  )} - ${formatMatchTeam2(stageItemsLookup, matchesLookup, match)}`;
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
      <Group position="apart">
        <Text weight={500}>
          <EllipsisText text={matchName} length={40} />
        </Text>
        <Badge color="indigo" variant="light" size="lg">
          <Time datetime={match.start_time} />
        </Badge>
      </Group>
      <Badge color="indigo" variant="dot">
        {matchesLookup[match.id].stageItem.name}
      </Badge>
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
  const rows = matches
    .filter((match: MatchInterface) => match.start_time != null)
    .sort((m1, m2) => (m1.start_time > m2.start_time ? 1 : 0))
    .map((match: MatchInterface) => (
      <ScheduleRow
        stageItemsLookup={stageItemsLookup}
        matchesLookup={matchesLookup}
        match={match}
        key={match.id}
      />
    ));

  const noItemsAlert =
    matches.length < 1 ? (
      <Alert icon={<IconAlertCircle size={16} />} title="No matches yet" color="gray" radius="md">
        Drop a match here
      </Alert>
    ) : null;

  return (
    <div style={{ width: '26rem', marginLeft: '0.5rem', marginRight: '0.5rem' }}>
      <h4>{court.name}</h4>
      {rows}
      {noItemsAlert}
    </div>
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
      matches={matchesByCourtId[court.id] || []}
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
      <Grid grow>
        <Grid.Col span={6}>
          <Title>Schedule</Title>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group position="right">
            <Button
              color="indigo"
              size="md"
              variant="filled"
              style={{ marginBottom: 10 }}
              leftIcon={<IconCalendarPlus size={24} />}
              onClick={async () => {
                await scheduleMatches(tournamentData.id);
                await swrStagesResponse.mutate(null);
              }}
            >
              Schedule all matches
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
      <Group grow mt="1rem">
        <Schedule
          swrCourtsResponse={swrCourtsResponse}
          matchesByCourtId={matchesByCourtId}
          stageItemsLookup={stageItemsLookup}
          matchesLookup={matchesLookup}
        />
      </Group>
    </TournamentLayout>
  );
}
