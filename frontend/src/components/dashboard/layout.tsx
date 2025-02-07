import {
  Box,
  Center,
  Container,
  Group,
  Image,
  Skeleton,
  Title,
  UnstyledButton,
} from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import QRCode from 'react-qr-code';

import { Tournament } from '../../interfaces/tournament';
import { getBaseApiUrl } from '../../services/adapter';
import { getBaseURL } from '../utils/util';
import classes from './layout.module.css';

export function TournamentQRCode({ tournamentDataFull }: { tournamentDataFull: Tournament }) {
  if (tournamentDataFull == null) {
    return null;
  }
  return (
    <div
      style={{
        width: '100%',
        background: 'white',
        marginTop: '2rem',
        maxWidth: '400px',
        height: 'auto',
        borderRadius: '16px',
        alignSelf: 'end',
      }}
    >
      <Center>
        <QRCode
          style={{ margin: '24px' }}
          // @ts-ignore
          size="auto"
          value={`${getBaseURL()}/tournaments/${tournamentDataFull.dashboard_endpoint}/dashboard`}
        />
      </Center>
    </div>
  );
}

export function TournamentLogo({ tournamentDataFull }: { tournamentDataFull: Tournament }) {
  if (tournamentDataFull == null) {
    return <Skeleton height={150} radius="xl" mb="xl" />;
  }
  return tournamentDataFull.logo_path ? (
    <>
      <Image
        radius="lg"
        mt="1rem"
        alt="Logo of the tournament"
        src={`${getBaseApiUrl()}/static/tournament-logos/${tournamentDataFull.logo_path}`}
        style={{ maxWidth: '400px' }}
      />
    </>
  ) : null;
}

export function TournamentHeadTitle({ tournamentDataFull }: { tournamentDataFull: Tournament }) {
  return tournamentDataFull != null ? (
    <title>{tournamentDataFull.name}</title>
  ) : (
    <title>Bracket</title>
  );
}

export function TournamentTitle({ tournamentDataFull }: { tournamentDataFull: Tournament }) {
  return tournamentDataFull != null ? (
    <Title>{tournamentDataFull.name}</Title>
  ) : (
    <Skeleton height={50} radius="lg" mb="xl" />
  );
}

export function DoubleHeader({ tournamentData }: { tournamentData: Tournament }) {
  const router = useRouter();
  const endpoint = tournamentData.dashboard_endpoint;
  const pathName = router.pathname.replace('[id]', endpoint).replace(/\/+$/, '');

  const mainLinks = [
    { link: `/tournaments/${endpoint}/dashboard`, label: 'Matches' },
    { link: `/tournaments/${endpoint}/dashboard/standings`, label: 'Standings' },
  ];

  const mainItems = mainLinks.map((item) => (
    <Link
      href={item.link}
      key={item.label}
      className={classes.mainLink}
      data-active={item.link === pathName || undefined}
    >
      {item.label}
    </Link>
  ));

  return (
    <header className={classes.header}>
      <Container className={classes.inner}>
        <UnstyledButton component={Link} href={`/tournaments/${endpoint}/dashboard`}>
          <Title size="lg" lineClamp={1}>
            {tournamentData.name}
          </Title>
        </UnstyledButton>
        <Box className={classes.links}>
          <Group gap={0} className={classes.mainLinks}>
            {mainItems}
          </Group>
        </Box>
      </Container>
    </header>
  );
}
