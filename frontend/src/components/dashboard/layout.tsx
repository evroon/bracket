import { Image, Skeleton, Title } from '@mantine/core';
import React from 'react';

import { Tournament } from '../../interfaces/tournament';
import { getBaseApiUrl } from '../../services/adapter';

export function TournamentLogo({ tournamentDataFull }: { tournamentDataFull: Tournament }) {
  if (tournamentDataFull == null) {
    return <Skeleton height={150} radius="xl" mb="xl" />;
  }
  return tournamentDataFull.logo_path ? (
    <Image
      radius="lg"
      mt={12}
      src={`${getBaseApiUrl()}/static/${tournamentDataFull.logo_path}`}
      style={{ maxWidth: '400px' }}
    />
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
