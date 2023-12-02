import { Center, Grid, MantineColor, useMantineTheme } from '@mantine/core';
import React from 'react';

import { Court } from '../../interfaces/court';
import { MatchInterface } from '../../interfaces/match';
import MatchLarge from './match_large';

export function CourtBadge({ name, color }: { name: string; color: MantineColor }) {
  const theme = useMantineTheme();
  return (
    <Center
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors[color][7],
        borderRadius: '8px',
        padding: '8px 16px 8px 16px',
        fontSize: '1.8rem',
      }}
    >
      <b>{name}</b>
    </Center>
  );
}

function getRoundsGridCols(match: MatchInterface | null) {
  if (match == null) {
    return null;
  }
  return <MatchLarge key={match.id} match={match} />;
}

export default function CourtsLarge({
  court,
  activeMatch,
  nextMatch,
}: {
  court: Court;
  activeMatch: MatchInterface | null;
  nextMatch: MatchInterface | null;
}) {
  return (
    <Grid align="center" style={{ marginTop: '1rem' }} gutter="2rem">
      <Grid.Col span={{ sm: 2 }}>
        <CourtBadge name={court.name} color="indigo" />
      </Grid.Col>
      <Grid.Col span={{ sm: 5 }}>
        <Grid>{getRoundsGridCols(activeMatch)}</Grid>
      </Grid.Col>
      <Grid.Col span={{ sm: 5 }}>
        <Grid>{getRoundsGridCols(nextMatch)}</Grid>
      </Grid.Col>
    </Grid>
  );
}
