import { Alert, Badge, Card, Center, Flex, Grid, Group, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React from 'react';

import {
  TournamentHeadTitle,
  TournamentLogo,
  TournamentTitle,
} from '../../../../components/dashboard/layout';
import { NoContent } from '../../../../components/no_content/empty_table_info';
import { Time, formatTime } from '../../../../components/utils/datetime';
import { Translator } from '../../../../components/utils/types';
import { responseIsValid } from '../../../../components/utils/util';
import { formatMatchTeam1, formatMatchTeam2 } from '../../../../interfaces/match';
import { getCourts, getStages } from '../../../../services/adapter';
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
  const winColor = '#2a8f37';
  const drawColor = '#656565';
  const loseColor = '#af4034';
  const team1_color =
    data.match.team1_score > data.match.team2_score
      ? winColor
      : data.match.team1_score === data.match.team2_score
        ? drawColor
        : loseColor;
  const team2_color =
    data.match.team2_score > data.match.team1_score
      ? winColor
      : data.match.team1_score === data.match.team2_score
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
            <Text fw={500}>{formatMatchTeam1(stageItemsLookup, matchesLookup, data.match)}</Text>
          </Grid.Col>
          <Grid.Col span="content" pb="0rem">
            <div
              style={{
                backgroundColor: team1_color,
                borderRadius: '0.5rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                color: 'white',
                fontWeight: 800,
              }}
            >
              {data.match.team1_score}
            </div>
          </Grid.Col>
        </Grid>
        <Grid mb="0rem">
          <Grid.Col span="auto" pb="0rem">
            <Text fw={500}>{formatMatchTeam2(stageItemsLookup, matchesLookup, data.match)}</Text>
          </Grid.Col>
          <Grid.Col span="content" pb="0rem">
            <div
              style={{
                backgroundColor: team2_color,
                borderRadius: '0.5rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                color: 'white',
                fontWeight: 800,
              }}
            >
              {data.match.team2_score}
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
  if (matchesLookup.length < 1) {
    return <NoContent title={t('no_matches_title')} description={t('no_matches_description')} />;
  }

  const matches: any[] = Object.values(matchesLookup);
  const sortedMatches = matches
    .sort((m1: any, m2: any) => (m1.match.court.name > m2.match.court.name ? 1 : -1))
    .sort((m1: any, m2: any) => (m1.match.start_time > m2.match.start_time ? 1 : -1));

  const rows: React.JSX.Element[] = [];

  for (let c = 0; c < sortedMatches.length; c += 1) {
    const data = sortedMatches[c];

    if (c < 1 || (data.match.start_time && sortedMatches[c - 1].match.start_time)) {
      const startTime = formatTime(data.match.start_time);

      if (c < 1 || startTime !== formatTime(sortedMatches[c - 1].match.start_time)) {
        rows.push(
          <Center mt="md" key={`time-${c}`}>
            <Text fw={800}>{startTime}</Text>
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
    <Group wrap="nowrap" align="top">
      <div style={{ width: '48rem' }}>
        {rows}
        {noItemsAlert}
      </div>
    </Group>
  );
}

export default function SchedulePage() {
  const { t } = useTranslation();
  const tournamentResponse = getTournamentResponseByEndpointName();

  // Hack to avoid unequal number of rendered hooks.
  const notFound = tournamentResponse == null || tournamentResponse[0] == null;
  const tournamentId = !notFound ? tournamentResponse[0].id : -1;
  const tournamentDataFull = tournamentResponse != null ? tournamentResponse[0] : null;

  const swrStagesResponse = getStages(tournamentId);
  const swrCourtsResponse = getCourts(tournamentId);

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
      <Center mt="1rem">
        <Schedule t={t} matchesLookup={matchesLookup} stageItemsLookup={stageItemsLookup} />
      </Center>
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
