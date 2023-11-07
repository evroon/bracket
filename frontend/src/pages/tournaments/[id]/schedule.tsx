import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Alert, Badge, Button, Card, Grid, Group, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconCalendarPlus } from '@tabler/icons-react';
import assert from 'assert';
import React from 'react';
// @ts-ignore
import EllipsisText from 'react-ellipsis-text';

import { Time } from '../../../components/utils/datetime';
import { getTournamentIdFromRouter, responseIsValid } from '../../../components/utils/util';
import { Court } from '../../../interfaces/court';
import { MatchInterface, formatMatchTeam1, formatMatchTeam2 } from '../../../interfaces/match';
import { getCourts, getStages } from '../../../services/adapter';
import {
  getMatchLookup,
  getMatchLookupByCourt,
  getScheduleData,
  getStageItemLookup,
} from '../../../services/lookups';
import { rescheduleMatch, scheduleMatches } from '../../../services/match';
import TournamentLayout from '../_tournament_layout';

function ScheduleRow({
  index,
  match,
  stageItemsLookup,
  matchesLookup,
}: {
  index: number;
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
    <Draggable key={match.id} index={index} draggableId={`${match.id}`}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            mt="md"
            {...provided.dragHandleProps}
          >
            <Group position="apart">
              <Group>
                {/*<IconGripVertical stroke={1.5} />*/}
                <Text weight={500}>
                  <EllipsisText text={matchName} length={40} />
                </Text>
              </Group>
              <Badge color="indigo" variant="light" size="lg">
                <Time datetime={match.start_time} />
              </Badge>
            </Group>
            <Badge color="indigo" variant="dot">
              {matchesLookup[match.id].stageItem.name}
            </Badge>
          </Card>
        </div>
      )}
    </Draggable>
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
  const rows = matches.map((match: MatchInterface, index: number) => (
    <ScheduleRow
      index={index}
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
    <Droppable droppableId={`${court.id}`} direction="vertical">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          <div style={{ width: '26rem', marginLeft: '0.5rem', marginRight: '0.5rem' }}>
            <h4>{court.name}</h4>
            {rows}
            {noItemsAlert}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}

function Schedule({
  stageItemsLookup,
  matchesLookup,
  schedule,
}: {
  stageItemsLookup: any;
  matchesLookup: any;
  schedule: { court: Court; matches: MatchInterface[] }[];
}) {
  const columns = schedule.map((item) => (
    <ScheduleColumn
      stageItemsLookup={stageItemsLookup}
      matchesLookup={matchesLookup}
      key={item.court.id}
      court={item.court}
      matches={item.matches}
    />
  ));
  return <Grid>{columns}</Grid>;
}

export default function SchedulePage() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrStagesResponse = getStages(tournamentData.id);

  const swrCourtsResponse = getCourts(tournamentData.id);

  const stageItemsLookup = responseIsValid(swrStagesResponse)
    ? getStageItemLookup(swrStagesResponse)
    : [];
  const matchesLookup = responseIsValid(swrStagesResponse) ? getMatchLookup(swrStagesResponse) : [];
  const matchesByCourtId = responseIsValid(swrStagesResponse)
    ? getMatchLookupByCourt(swrStagesResponse)
    : [];

  const data =
    responseIsValid(swrCourtsResponse) && responseIsValid(swrStagesResponse)
      ? getScheduleData(swrCourtsResponse, matchesByCourtId)
      : [];

  if (!responseIsValid(swrStagesResponse)) return null;
  if (!responseIsValid(swrCourtsResponse)) return null;

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
        <DragDropContext
          onDragEnd={async ({ destination, source, draggableId: matchId }) => {
            if (destination == null || source == null) return;
            await rescheduleMatch(tournamentData.id, +matchId, {
              old_court_id: +source.droppableId,
              old_position: source.index,
              new_court_id: +destination.droppableId,
              new_position: destination.index,
            });
            await swrStagesResponse.mutate(null);
          }}
        >
          <Schedule
            schedule={data}
            stageItemsLookup={stageItemsLookup}
            matchesLookup={matchesLookup}
          />
        </DragDropContext>
      </Group>
    </TournamentLayout>
  );
}
