import { Progress } from '@mantine/core';

interface PlayerStatisticsProps {
  wins: number;
  draws: number;
  losses: number;
}

export function WinDistribution({ wins, draws, losses }: PlayerStatisticsProps) {
  const percentageScale = 100.0 / (wins + draws + losses);
  const empty = wins + draws + losses === 0;

  return (
    <>
      <Progress.Root size={20}>
        <Progress.Section value={empty ? 33.3 : percentageScale * wins} color="teal">
          <Progress.Label>{`${wins.toFixed(0)}`}</Progress.Label>
        </Progress.Section>
        <Progress.Section value={empty ? 33.3 : percentageScale * draws} color="orange">
          <Progress.Label>{`${draws.toFixed(0)}`}</Progress.Label>
        </Progress.Section>
        <Progress.Section value={empty ? 33.3 : percentageScale * losses} color="red">
          <Progress.Label>{`${losses.toFixed(0)}`}</Progress.Label>
        </Progress.Section>
      </Progress.Root>
    </>
  );
}
