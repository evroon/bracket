import { Group, Progress, Text, createStyles } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  progressBar: {
    '&:not(:first-of-type)': {
      borderLeft: `3px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white}`,
    },
  },
}));

interface PlayerStatisticsProps {
  wins: number;
  draws: number;
  losses: number;
}

export function getWinColor() {
  const { theme } = useStyles();
  return theme.colorScheme === 'dark' ? theme.colors.teal[9] : theme.colors.teal[6];
}

export function getDrawColor() {
  const { theme } = useStyles();
  return theme.colorScheme === 'dark' ? theme.colors.orange[9] : theme.colors.orange[6];
}

export function getLossColor() {
  const { theme } = useStyles();
  return theme.colorScheme === 'dark' ? theme.colors.red[9] : theme.colors.red[6];
}

export function WinDistribution({ wins, draws, losses }: PlayerStatisticsProps) {
  const { classes } = useStyles();
  const percentageScale = 100.0 / (wins + draws + losses);

  const draws_text =
    draws === 0 ? null : (
      <Text size="xs" color="orange" weight={700}>
        {draws.toFixed(0)}
      </Text>
    );

  return (
    <>
      <Group position="apart">
        <Text size="xs" color="teal" weight={700}>
          {wins.toFixed(0)}
        </Text>
        {draws_text}
        <Text size="xs" color="red" weight={700}>
          {losses.toFixed(0)}
        </Text>
      </Group>
      <Progress
        classNames={{ bar: classes.progressBar }}
        sections={[
          {
            value: percentageScale * wins,
            color: getWinColor(),
            tooltip: `Wins (${(percentageScale * wins).toFixed(0)}%)`,
          },
          {
            value: percentageScale * draws,
            color: getDrawColor(),
            tooltip: `Draws (${(percentageScale * draws).toFixed(0)}%)`,
          },
          {
            value: percentageScale * losses,
            color: getLossColor(),
            tooltip: `Losses (${(percentageScale * losses).toFixed(0)}%)`,
          },
        ]}
      />
    </>
  );
}
