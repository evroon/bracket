import { Image, Skeleton, Title } from '@mantine/core';
import React from 'react';
import QRCode from 'react-qr-code';

import { Tournament } from '../../interfaces/tournament';
import { getBaseApiUrl } from '../../services/adapter';
import { getBaseURL } from '../utils/util';

export function TournamentQRCode({ tournamentDataFull }: { tournamentDataFull: Tournament }) {
  return (
    <div style={{ background: 'white', padding: '16px', marginTop: '3rem' }}>
      <QRCode
        style={{ justifyContent: 'center', maxWidth: '100%', width: '100%' }}
        value={`${getBaseURL()}/tournaments/${tournamentDataFull.dashboard_endpoint}/dashboard`}
        // value={"hey"}
      />
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
