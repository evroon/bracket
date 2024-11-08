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

export default function CourtsLarge({
  court,
  activeMatch,
  nextMatch,
  stageItemsLookup,
}: {
  court: Court;
  activeMatch: MatchInterface | null;
  nextMatch: MatchInterface | null;
  stageItemsLookup: any;
}) {
  return (
    <Grid align="center" style={{ marginTop: '1rem' }} gutter="2rem">
      <Grid.Col span={{ sm: 2 }}>
        <CourtBadge name={court.name} color="indigo" />
      </Grid.Col>
      <Grid.Col span={{ sm: 5 }}>
        <Grid>
          {activeMatch != null && (
            <MatchLarge
              key={activeMatch.id}
              match={activeMatch}
              stageItemsLookup={stageItemsLookup}
            />
          )}
        </Grid>
      </Grid.Col>
      <Grid.Col span={{ sm: 5 }}>
        <Grid>
          {nextMatch != null && (
            <MatchLarge key={nextMatch.id} match={nextMatch} stageItemsLookup={stageItemsLookup} />
          )}
        </Grid>
      </Grid.Col>
    </Grid>
  );
}
