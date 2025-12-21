import { Card, Center, Grid, Text } from '@mantine/core';

import { Time } from '@components/utils/datetime';
import { formatStageItemInput } from '@components/utils/stage_item_input';
import { MatchWithDetails } from '@openapi';

export default function MatchLarge({
  match,
  stageItemsLookup,
}: {
  match: MatchWithDetails;
  stageItemsLookup: any;
}) {
  const bracket = (
    <div>
      <Card padding="md" shadow="sm" radius="lg" withBorder>
        <Grid align="center">
          <Grid.Col span={{ sm: 9 }}>
            <Text lineClamp={1} inherit>
              {formatStageItemInput(match.stage_item_input1, stageItemsLookup) || <i>N/A</i>}
            </Text>
            <Text lineClamp={1} inherit>
              {formatStageItemInput(match.stage_item_input2, stageItemsLookup) || <i>N/A</i>}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ sm: 3 }}>
            <Center>
              <Time datetime={match.start_time || ''} />
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
