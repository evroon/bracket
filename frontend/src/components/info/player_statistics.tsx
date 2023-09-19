import { Progress } from '@mantine/core';

interface PlayerStatisticsProps {
  wins: number;
  draws: number;
  losses: number;
}

export function WinDistribution({ wins, draws, losses }: PlayerStatisticsProps) {
  const percentageScale = 100.0 / (wins + draws + losses);

  return (
    <>
      <Progress.Root size={20}>
        <Progress.Section value={percentageScale * wins} color="teal">
          <Progress.Label>{`${wins.toFixed(0)}`}</Progress.Label>
        </Progress.Section>
        <Progress.Section value={percentageScale * draws} color="orange">
          <Progress.Label>{`${draws.toFixed(0)}`}</Progress.Label>
        </Progress.Section>
        <Progress.Section value={percentageScale * losses} color="red">
          <Progress.Label>{`${losses.toFixed(0)}`}</Progress.Label>
        </Progress.Section>
      </Progress.Root>
    </>
  );
}
