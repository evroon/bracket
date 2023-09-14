import { Group, Progress, Text, useMantineTheme } from '@mantine/core';
import { DefaultMantineColor } from '@mantine/styles/lib/theme/types/MantineColor';

interface ScoreProps {
  score: number;
  min_score: number;
  max_score: number;
  color: DefaultMantineColor;
  decimals: number;
}

export function PlayerScore({ score, min_score, max_score, color, decimals }: ScoreProps) {
  const theme = useMantineTheme();
  const percentageScale = 100.0 / (max_score - min_score);
  const base_color = theme.colors[color];

  return (
    <>
      <Group position="apart">
        <Text size="xs" color={color} weight={700}>
          {score.toFixed(decimals)}
        </Text>
      </Group>
      <Progress
        sections={[
          {
            value: percentageScale * (score - min_score),
            color: theme.colorScheme === 'dark' ? base_color[9] : base_color[6],
            tooltip: `${(percentageScale * (score - min_score)).toFixed(decimals)}%`,
          },
        ]}
      />
    </>
  );
}
