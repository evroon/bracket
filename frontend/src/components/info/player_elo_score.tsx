import { Group, Progress, Text, useMantineTheme } from '@mantine/core';

interface ELOProps {
  elo_score: number;
  max_elo_score: number;
}

export function PlayerELOScore({ elo_score, max_elo_score }: ELOProps) {
  const theme = useMantineTheme();
  const percentageScale = 100.0 / max_elo_score;

  return (
    <>
      <Group position="apart">
        <Text size="xs" color="blue" weight={700}>
          {elo_score.toFixed(0)}
        </Text>
      </Group>
      <Progress
        sections={[
          {
            value: percentageScale * elo_score,
            color: theme.colorScheme === 'dark' ? theme.colors.blue[9] : theme.colors.blue[6],
            tooltip: `ELO Score (${(percentageScale * elo_score).toFixed(0)}%)`,
          },
        ]}
      />
    </>
  );
}
