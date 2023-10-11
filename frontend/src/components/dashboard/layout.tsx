import { Center, Image, Skeleton, Title } from '@mantine/core';
import React from 'react';
import QRCode from 'react-qr-code';

import { Tournament } from '../../interfaces/tournament';
import { getBaseApiUrl } from '../../services/adapter';
import { getBaseURL } from '../utils/util';

export function TournamentQRCode({ tournamentDataFull }: { tournamentDataFull: Tournament }) {
  return (
    <Center>
      <div
        style={{
          width: '100%',
          background: 'white',
          marginTop: '3rem',
          maxWidth: '400px',
          height: 'auto',
        }}
      >
        <Center>
          <QRCode
            style={{ margin: '32px 0px 32px 0px' }}
            value={`${getBaseURL()}/tournaments/${tournamentDataFull.dashboard_endpoint}/dashboard`}
          />
        </Center>
      </div>
    </Center>
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
        src={`${getBaseApiUrl()}/static/${tournamentDataFull.logo_path}`}
        style={{ maxWidth: '400px' }}
      />
      <TournamentQRCode tournamentDataFull={tournamentDataFull} />
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
