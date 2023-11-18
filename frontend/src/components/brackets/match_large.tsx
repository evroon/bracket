import { Card, Center, Grid } from '@mantine/core';
import assert from 'assert';
import React from 'react';

import { MatchInterface } from '../../interfaces/match';
import { Time } from '../utils/datetime';

export default function MatchLarge({ match }: { match: MatchInterface }) {
  assert(match.team1 != null);
  assert(match.team2 != null);

  const bracket = (
    <div>
      <Card padding="md" shadow="sm" radius="lg" withBorder>
        <Grid align="center">
          <Grid.Col sm={9}>
            <div>{match.team1.name}</div>
            <div>{match.team2.name}</div>
          </Grid.Col>
          <Grid.Col sm={3}>
            <Center>
              <Time datetime={match.start_time} />
            </Center>
          </Grid.Col>
        </Grid>
      </Card>
    </div>
  );

  return (
    <div
      style={{
        width: '100%',
        padding: '0px',
        fontSize: '2rem',
      }}
    >
      {bracket}
    </div>
  );
}
