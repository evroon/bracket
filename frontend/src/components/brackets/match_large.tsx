import { Card, Center, Grid, Text } from '@mantine/core';
import assert from 'assert';
import React from 'react';

import { MatchInterface } from '../../interfaces/match';
import { Time } from '../utils/datetime';

export default function MatchLarge({ match }: { match: MatchInterface }) {
  assert(match.stage_item_input1?.team != null);
  assert(match.stage_item_input2?.team != null);

  const bracket = (
    <div>
      <Card padding="md" shadow="sm" radius="lg" withBorder>
        <Grid align="center">
          <Grid.Col span={{ sm: 9 }}>
            <Text lineClamp={1}>{match.stage_item_input1.team.name}</Text>
            <Text lineClamp={1}>{match.stage_item_input2.team.name}</Text>
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
