import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Alert, Badge, Button, Card, Grid, Group, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconCalendarPlus } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useState } from 'react';

import MatchModal from '../../../components/modals/match_modal';
import { NoContent } from '../../../components/no_content/empty_table_info';
import { Time } from '../../../components/utils/datetime';
import { Translator } from '../../../components/utils/types';
import { getTournamentIdFromRouter, responseIsValid } from '../../../components/utils/util';
import { Court } from '../../../interfaces/court';
import { MatchInterface, formatMatchTeam1, formatMatchTeam2 } from '../../../interfaces/match';
import { getCourts, getStages } from '../../../services/adapter';
import {
  getMatchLookup,
  getMatchLookupByCourt,
  getScheduleData,
  getStageItemLookup,
  stringToColour,
} from '../../../services/lookups';
import { rescheduleMatch, scheduleMatches } from '../../../services/match';
import TournamentLayout from '../_tournament_layout';

function ScheduleRow({
  index,
  match,
  openMatchModal,
  stageItemsLookup,
  matchesLookup,
}: {
  index: number;
  match: MatchInterface;
  openMatchModal: any;
  stageItemsLookup: any;
  matchesLookup: any;
}) {
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
            onClick={() => {
              openMatchModal(match);
            }}
            {...provided.dragHandleProps}
          >
            <Grid>
              <Grid.Col span="auto">
                <Text fw={500}>{formatMatchTeam1(stageItemsLookup, matchesLookup, match)}</Text>
                <Text fw={500}>{formatMatchTeam2(stageItemsLookup, matchesLookup, match)}</Text>
              </Grid.Col>
              <Grid.Col span="content">
                <Stack gap="xs" align="end">
                  <Badge variant="default" size="lg">
                    {match.start_time != null ? <Time datetime={match.start_time} /> : null}
                  </Badge>
                  <Badge
                    color={stringToColour(`${matchesLookup[match.id].stageItem.id}`)}
                    variant="outline"
                  >
                    {matchesLookup[match.id].stageItem.name}
                  </Badge>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

function ScheduleColumn({
  court,
  matches,
  openMatchModal,
  stageItemsLookup,
  matchesLookup,
}: {
  court: Court;
  matches: MatchInterface[];
  openMatchModal: any;
  stageItemsLookup: any;
  matchesLookup: any;
}) {
  const { t } = useTranslation();
  const rows = matches.map((match: MatchInterface, index: number) => (
    <ScheduleRow
      index={index}
      stageItemsLookup={stageItemsLookup}
      matchesLookup={matchesLookup}
      match={match}
      openMatchModal={openMatchModal}
      key={match.id}
    />
  ));

  const noItemsAlert =
    matches.length < 1 ? (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={t('no_matches_title')}
        color="gray"
        radius="md"
      >
        {t('drop_match_alert_title')}
      </Alert>
    ) : null;

  return (
    <Droppable droppableId={`${court.id}`} direction="vertical">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          <div style={{ width: '25rem' }}>
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
  t,
  stageItemsLookup,
  matchesLookup,
  schedule,
  openMatchModal,
}: {
  t: Translator;
  stageItemsLookup: any;
  matchesLookup: any;
  schedule: { court: Court; matches: MatchInterface[] }[];
  openMatchModal: CallableFunction;
}) {
  const columns = schedule.map((item) => (
    <ScheduleColumn
      stageItemsLookup={stageItemsLookup}
      matchesLookup={matchesLookup}
      key={item.court.id}
      court={item.court}
      matches={item.matches}
      openMatchModal={openMatchModal}
    />
  ));

  if (columns.length < 1) {
    return <NoContent title={t('no_matches_title')} description={t('no_matches_description')} />;
  }

  return (
    <Group wrap="nowrap" align="top">
      {columns}
    </Group>
  );
}

export default function SchedulePage() {
  const [modalOpened, modalSetOpened] = useState(false);
  const [match, setMatch] = useState<MatchInterface | null>(null);

  const { t } = useTranslation();
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

  function openMatchModal(matchToOpen: MatchInterface) {
    setMatch(matchToOpen);
    modalSetOpened(true);
  }

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      {match != null ? (
        <MatchModal
          swrStagesResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={null}
          tournamentData={tournamentData}
          match={match}
          opened={modalOpened}
          setOpened={modalSetOpened}
          dynamicSchedule={false}
        />
      ) : null}
      <Grid grow>
        <Grid.Col span={6}>
          <Title>{t('planning_title')}</Title>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group justify="right">
            <Button
              color="indigo"
              size="md"
              variant="filled"
              style={{ marginBottom: 10 }}
              leftSection={<IconCalendarPlus size={24} />}
              onClick={async () => {
                await scheduleMatches(tournamentData.id);
                await swrStagesResponse.mutate();
              }}
            >
              {t('schedule_description')}
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
            await swrStagesResponse.mutate();
          }}
        >
          <Schedule
            t={t}
            schedule={data}
            stageItemsLookup={stageItemsLookup}
            matchesLookup={matchesLookup}
            openMatchModal={openMatchModal}
          />
        </DragDropContext>
      </Group>
    </TournamentLayout>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
