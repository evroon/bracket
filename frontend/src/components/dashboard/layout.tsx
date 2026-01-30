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
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { useLocation } from 'react-router';

import PreloadLink from '@components/utils/link';
import { getBaseURL } from '@components/utils/util';
import { Tournament } from '@openapi';
import { getBaseApiUrl, getTournamentLogoUrl } from '@services/adapter';
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
  const [hasError, setHasError] = useState(false);
  if (tournamentDataFull == null) {
    return <Skeleton height={150} radius="xl" mb="xl" />;
  }
  const src = getTournamentLogoUrl(tournamentDataFull.id, tournamentDataFull.logo_path);
  if (!src || hasError) return null;
  return (
    <Image
      radius="lg"
      mt="1rem"
      alt="Logo of the tournament"
      src={src}
      style={{ maxWidth: '400px' }}
      onError={() => setHasError(true)}
    />
  );
}

export function getTournamentHeadTitle(tournamentDataFull: Tournament) {
  return tournamentDataFull !== null ? `Bracket | ${tournamentDataFull.name}` : 'Bracket';
}

export function TournamentTitle({ tournamentDataFull }: { tournamentDataFull: Tournament }) {
  return tournamentDataFull != null ? (
    <Title>{tournamentDataFull.name}</Title>
  ) : (
    <Skeleton height={50} radius="lg" mb="xl" />
  );
}

export function DoubleHeader({ tournamentData }: { tournamentData: Tournament }) {
  const navigate = useLocation();
  const endpoint = tournamentData.dashboard_endpoint || '';
  const pathName = navigate.pathname.replace('[id]', endpoint).replace(/\/+$/, '');

  const mainLinks = [
    { link: `/tournaments/${endpoint}/dashboard`, label: 'Matches' },
    { link: `/tournaments/${endpoint}/dashboard/bracket`, label: 'Bracket' },
    { link: `/tournaments/${endpoint}/dashboard/standings`, label: 'Standings' },
    { link: `/tournaments/${endpoint}/official-portal`, label: 'Officials' },
  ];

  const mainItems = mainLinks.map((item) => (
    <PreloadLink
      href={item.link}
      key={item.label}
      className={classes.mainLink}
      data-active={item.link === pathName || undefined}
    >
      {item.label}
    </PreloadLink>
  ));

  return (
    <header className={classes.header}>
      <Container className={classes.inner}>
        <UnstyledButton component={PreloadLink} href={`/tournaments/${endpoint}/dashboard`}>
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
