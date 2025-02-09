import { Badge, Button, Card, Group, Image, Text, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React from 'react';
import { SWRResponse } from 'swr';

import { Tournament } from '../../interfaces/tournament';
import { getBaseApiUrl } from '../../services/adapter';
import { EmptyTableInfo } from '../no_content/empty_table_info';
import { DateTime } from '../utils/datetime';
import RequestErrorAlert from '../utils/error_alert';
import { TableSkeletonSingleColumn } from '../utils/skeletons';
import classes from './tournaments.module.css';

export function TournamentLogo({ tournament }: { tournament: Tournament }) {
  return (
    <Image
      radius="md"
      alt="Logo of the tournament"
      src={`${getBaseApiUrl()}/static/tournament-logos/${tournament.logo_path}`}
      fallbackSrc={`https://placehold.co/318x160?text=${tournament.name}`}
      height={160}
    />
  );
}

function Stat({ title, value }: { title: string; value: any }) {
  return (
    <div key={title}>
      <Text size="xs" c="dimmed">
        {title}
      </Text>
      <Text fw={500} size="sm">
        {value}
      </Text>
    </div>
  );
}

export default function TournamentsCardTable({
  swrTournamentsResponse,
}: {
  swrTournamentsResponse: SWRResponse;
}) {
  const { t } = useTranslation();

  if (swrTournamentsResponse.error) {
    return <RequestErrorAlert error={swrTournamentsResponse.error} />;
  }
  if (swrTournamentsResponse.isLoading) {
    return <TableSkeletonSingleColumn />;
  }

  const tournaments: Tournament[] =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : [];

  const rows = tournaments
    .sort((t1: Tournament, t2: Tournament) => t1.name.localeCompare(t2.name))
    .map((tournament) => (
      <Group key={tournament.id} className={classes.card}>
        <UnstyledButton component={Link} href={`/tournaments/${tournament.id}/stages`} w="100%">
          <Card shadow="sm" padding="lg" radius="md" withBorder w="100%">
            <Card.Section>
              <TournamentLogo tournament={tournament} />
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500} lineClamp={1}>
                {tournament.name}
              </Text>
            </Group>

            <Card.Section className={classes.section}>
              <Stat title={t('start_time')} value={<DateTime datetime={tournament.start_time} />} />
            </Card.Section>

            <Card.Section className={classes.section}>
              <Group w="100%">
                <Badge
                  fullWidth
                  color="yellow"
                  variant="outline"
                  size="lg"
                  style={{ visibility: tournament.status === 'ARCHIVED' ? 'visible' : 'hidden' }}
                >
                  {t('archived_label')}
                </Badge>
                <Button
                  component={Link}
                  color="blue"
                  fullWidth
                  radius="md"
                  href={`/tournaments/${tournament.id}/stages`}
                >
                  OPEN
                </Button>
              </Group>
            </Card.Section>
          </Card>
        </UnstyledButton>
      </Group>
    ));

  if (rows.length < 1) return <EmptyTableInfo entity_name={t('tournaments_title')} />;

  return (
    <Group gap="sm" style={{ width: '100%' }}>
      {rows}
    </Group>
  );
}
