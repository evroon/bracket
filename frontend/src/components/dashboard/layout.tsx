import { Center, Image, Skeleton, Title } from '@mantine/core';
import React from 'react';
import QRCode from 'react-qr-code';

import { Tournament } from '../../interfaces/tournament';
import { getBaseApiUrl } from '../../services/adapter';
import { getBaseURL } from '../utils/util';

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
