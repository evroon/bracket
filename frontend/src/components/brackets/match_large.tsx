import { Card, Center, Grid, Text } from '@mantine/core';
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
          <Grid.Col span={{ sm: 9 }}>
            <Text lineClamp={1}>{match.team1.name}</Text>
            <Text lineClamp={1}>{match.team2.name}</Text>
          </Grid.Col>
          <Grid.Col span={{ sm: 3 }}>
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
        fontSize: '1.8rem',
      }}
    >
      {bracket}
    </div>
  );
}
