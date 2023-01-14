import { Group, Progress, Text, useMantineTheme } from '@mantine/core';
import { DefaultMantineColor } from '@mantine/styles/lib/theme/types/MantineColor';

interface ScoreProps {
  score: number;
  max_score: number;
  color: DefaultMantineColor;
}

export function PlayerScore({ score, max_score, color }: ScoreProps) {
  const theme = useMantineTheme();
  const percentageScale = 100.0 / max_score;
  const base_color = theme.colors[color];

  return (
    <>
      <Group position="apart">
        <Text size="xs" color={color} weight={700}>
          {score.toFixed(0)}
        </Text>
      </Group>
      <Progress
        sections={[
          {
            value: percentageScale * score,
            color: theme.colorScheme === 'dark' ? base_color[9] : base_color[6],
            tooltip: `ELO Score (${(percentageScale * score).toFixed(0)}%)`,
          },
        ]}
      />
    </>
  );
}
