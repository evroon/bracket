import { Alert, Badge, Card, Center, Flex, Grid, Group, Stack, Text } from '@mantine/core';
import { AiOutlineHourglass } from '@react-icons/all-files/ai/AiOutlineHourglass';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React from 'react';

import { DashboardFooter } from '../../../../components/dashboard/footer';
import { DoubleHeader, TournamentHeadTitle } from '../../../../components/dashboard/layout';
import { NoContent } from '../../../../components/no_content/empty_table_info';
import { Time, compareDateTime, formatTime } from '../../../../components/utils/datetime';
import { Translator } from '../../../../components/utils/types';
import { responseIsValid } from '../../../../components/utils/util';
import { formatMatchInput1, formatMatchInput2 } from '../../../../interfaces/match';
import { getCourtsLive, getStagesLive } from '../../../../services/adapter';
import { getMatchLookup, getStageItemLookup, stringToColour } from '../../../../services/lookups';
import { getTournamentResponseByEndpointName } from '../../../../services/tournament';

function ScheduleRow({
  data,
  stageItemsLookup,
  matchesLookup,
}: {
  data: any;
  stageItemsLookup: any;
  matchesLookup: any;
}) {
  const { t } = useTranslation();
  const winColor = '#2a8f37';
  const drawColor = '#656565';
  const loseColor = '#af4034';
  const team1_color =
    data.match.stage_item_input1_score > data.match.stage_item_input2_score
      ? winColor
      : data.match.stage_item_input1_score === data.match.stage_item_input2_score
        ? drawColor
        : loseColor;
  const team2_color =
    data.match.stage_item_input2_score > data.match.stage_item_input1_score
      ? winColor
      : data.match.stage_item_input1_score === data.match.stage_item_input2_score
        ? drawColor
        : loseColor;

  return (
    <Card shadow="sm" radius="md" withBorder mt="md" pt="0rem">
      <Card.Section withBorder>
        <Grid pt="0.75rem" pb="0.5rem">
          <Grid.Col mb="0rem" span={4}>
            <Text pl="sm" mt="sm" fw={800}>
              {data.match.court.name}
            </Text>
          </Grid.Col>
          <Grid.Col mb="0rem" span={4}>
            <Center>
              <Text mt="sm" fw={800}>
                {data.match.start_time != null ? <Time datetime={data.match.start_time} /> : null}
              </Text>
            </Center>
          </Grid.Col>
          <Grid.Col mb="0rem" span={4}>
            <Flex justify="right">
              <Badge
                color={stringToColour(`${data.stageItem.id}`)}
                variant="outline"
                mr="md"
                mt="0.8rem"
                size="md"
              >
                {data.stageItem.name}
              </Badge>
            </Flex>
          </Grid.Col>
        </Grid>
      </Card.Section>
      <Stack pt="sm">
        <Grid>
          <Grid.Col span="auto" pb="0rem">
            <Text fw={500}>
              {formatMatchInput1(t, stageItemsLookup, matchesLookup, data.match)}
            </Text>
          </Grid.Col>
          <Grid.Col span="content" pb="0rem">
            <div
              style={{
                backgroundColor: team1_color,
                borderRadius: '0.5rem',
                width: '2.5rem',
                color: 'white',
                fontWeight: 800,
              }}
            >
              <Center>{data.match.stage_item_input1_score}</Center>
            </div>
          </Grid.Col>
        </Grid>
        <Grid mb="0rem">
          <Grid.Col span="auto" pb="0rem">
            <Text fw={500}>
              {formatMatchInput2(t, stageItemsLookup, matchesLookup, data.match)}
            </Text>
          </Grid.Col>
          <Grid.Col span="content" pb="0rem">
            <div
              style={{
                backgroundColor: team2_color,
                borderRadius: '0.5rem',
                width: '2.5rem',
                color: 'white',
                fontWeight: 800,
              }}
            >
              <Center>{data.match.stage_item_input2_score}</Center>
            </div>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
}

export function Schedule({
  t,
  stageItemsLookup,
  matchesLookup,
}: {
  t: Translator;
  stageItemsLookup: any;
  matchesLookup: any;
}) {
  const matches: any[] = Object.values(matchesLookup);
  const sortedMatches = matches
    .filter((m1: any) => m1.match.start_time != null)
    .sort(
      (m1: any, m2: any) =>
        compareDateTime(m1.match.start_time, m2.match.start_time) ||
        m1.match.court?.name.localeCompare(m2.match.court?.name)
    );

  const rows: React.JSX.Element[] = [];

  for (let c = 0; c < sortedMatches.length; c += 1) {
    const data = sortedMatches[c];

    if (c < 1 || sortedMatches[c - 1].match.start_time) {
      const startTime = formatTime(data.match.start_time);

      if (c < 1 || startTime !== formatTime(sortedMatches[c - 1].match.start_time)) {
        rows.push(
          <Center mt="md" key={`time-${c}`}>
            <Text size="xl" fw={800}>
              {startTime}
            </Text>
          </Center>
        );
      }
    }

    rows.push(
      <ScheduleRow
        key={data.match.id}
        data={data}
        stageItemsLookup={stageItemsLookup}
        matchesLookup={matchesLookup}
      />
    );
  }

  if (rows.length < 1) {
    return <NoContent title={t('no_matches_title')} description="" icon={<AiOutlineHourglass />} />;
  }

  const noItemsAlert =
    matchesLookup.length < 1 ? (
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
    <Group wrap="nowrap" align="top" style={{ width: '100%' }}>
      <div style={{ width: '100%' }}>
        {rows}
        {noItemsAlert}
      </div>
    </Group>
  );
}

export default function SchedulePage() {
  const { t } = useTranslation();
  const tournamentResponse = getTournamentResponseByEndpointName();

  const notFound = tournamentResponse == null || tournamentResponse[0] == null;
  const tournamentId = !notFound ? tournamentResponse[0].id : null;
  const tournamentDataFull = tournamentResponse != null ? tournamentResponse[0] : null;

  const swrStagesResponse = getStagesLive(tournamentId);
  const swrCourtsResponse = getCourtsLive(tournamentId);

  const stageItemsLookup = responseIsValid(swrStagesResponse)
    ? getStageItemLookup(swrStagesResponse)
    : [];
  const matchesLookup = responseIsValid(swrStagesResponse) ? getMatchLookup(swrStagesResponse) : [];

  if (!responseIsValid(swrStagesResponse)) return null;
  if (!responseIsValid(swrCourtsResponse)) return null;

  return (
    <>
      <Head>
        <TournamentHeadTitle tournamentDataFull={tournamentDataFull} />
      </Head>
      <DoubleHeader tournamentData={tournamentDataFull} />
      <Center>
        <Group style={{ maxWidth: '48rem', width: '100%' }} px="1rem">
          <Schedule t={t} matchesLookup={matchesLookup} stageItemsLookup={stageItemsLookup} />
        </Group>
      </Center>
      <DashboardFooter />
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
