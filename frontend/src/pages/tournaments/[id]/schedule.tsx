import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Menu,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { AiFillWarning } from '@react-icons/all-files/ai/AiFillWarning';
import { IconAlertCircle, IconCalendarPlus, IconDots, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import CourtModal from '../../../components/modals/create_court_modal';
import MatchModal from '../../../components/modals/match_modal';
import { NoContent } from '../../../components/no_content/empty_table_info';
import { Time } from '../../../components/utils/datetime';
import { Translator } from '../../../components/utils/types';
import { getTournamentIdFromRouter, responseIsValid } from '../../../components/utils/util';
import { Court } from '../../../interfaces/court';
import { MatchInterface, formatMatchInput1, formatMatchInput2 } from '../../../interfaces/match';
import { TournamentMinimal } from '../../../interfaces/tournament';
import { getCourts, getStages } from '../../../services/adapter';
import { deleteCourt } from '../../../services/court';
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
  const { t } = useTranslation();
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
                <Group gap="xs">
                  {match.stage_item_input1_conflict && <AiFillWarning color="red" />}
                  <Text fw={500}>
                    {formatMatchInput1(t, stageItemsLookup, matchesLookup, match)}
                  </Text>
                </Group>
                <Group gap="xs">
                  {match.stage_item_input2_conflict && <AiFillWarning color="red" />}
                  <Text fw={500}>
                    {formatMatchInput2(t, stageItemsLookup, matchesLookup, match)}
                  </Text>
                </Group>
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
  tournamentId,
  court,
  matches,
  openMatchModal,
  stageItemsLookup,
  swrCourtsResponse,
  matchesLookup,
}: {
  tournamentId: number;
  court: Court;
  matches: MatchInterface[];
  openMatchModal: any;
  stageItemsLookup: any;
  swrCourtsResponse: SWRResponse;
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
        mt="1rem"
      >
        {t('drop_match_alert_title')}
      </Alert>
    ) : null;

  return (
    <Droppable droppableId={`${court.id}`} direction="vertical">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          <div style={{ width: '25rem' }}>
            <Group justify="space-between">
              <Group>
                <h4 style={{ marginTop: '0', margin: 'auto' }}>{court.name}</h4>
              </Group>
              <Menu withinPortal position="bottom-end" shadow="sm">
                <Menu.Target>
                  <ActionIcon variant="transparent" color="gray">
                    <IconDots size="1.25rem" />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconTrash size="1.5rem" />}
                    onClick={async () => {
                      await deleteCourt(tournamentId, court.id);
                      await swrCourtsResponse.mutate();
                    }}
                    color="red"
                  >
                    {t('delete_court_button')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
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
  tournament,
  swrCourtsResponse,
  stageItemsLookup,
  matchesLookup,
  schedule,
  openMatchModal,
}: {
  t: Translator;
  tournament: TournamentMinimal;
  swrCourtsResponse: SWRResponse;
  stageItemsLookup: any;
  matchesLookup: any;
  schedule: { court: Court; matches: MatchInterface[] }[];
  openMatchModal: CallableFunction;
}) {
  const columns = schedule.map((item) => (
    <ScheduleColumn
      tournamentId={tournament.id}
      swrCourtsResponse={swrCourtsResponse}
      stageItemsLookup={stageItemsLookup}
      matchesLookup={matchesLookup}
      key={item.court.id}
      court={item.court}
      matches={item.matches}
      openMatchModal={openMatchModal}
    />
  ));

  columns.push(
    <div style={{ width: '25rem' }}>
      <CourtModal
        swrCourtsResponse={swrCourtsResponse}
        tournamentId={tournament.id}
        buttonSize="xs"
      />
    </div>
  );
  if (columns.length < 2) {
    return (
      <Stack align="center">
        <NoContent title={t('no_courts_title')} description={t('no_courts_description')} />
        <CourtModal
          swrCourtsResponse={swrCourtsResponse}
          tournamentId={tournament.id}
          buttonSize="lg"
        />
      </Stack>
    );
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
          round={null}
        />
      ) : null}
      <Grid grow>
        <Grid.Col span={6}>
          <Title>{t('planning_title')}</Title>
        </Grid.Col>
        <Grid.Col span={6}>
          {data.length < 1 ? null : (
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
          )}
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
            tournament={tournamentData}
            swrCourtsResponse={swrCourtsResponse}
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
