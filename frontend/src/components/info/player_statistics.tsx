import { Progress } from '@mantine/core';

interface PlayerStatisticsProps {
  wins: number;
  draws: number;
  losses: number;
  fontSizeInPixels: number;
}

export function WinDistribution({ wins, draws, losses, fontSizeInPixels }: PlayerStatisticsProps) {
  const percentageScale = 100.0 / (wins + draws + losses);
  const empty = wins + draws + losses === 0;

  return (
    <>
      <Progress.Root size={fontSizeInPixels * 1.5}>
        <Progress.Section value={empty ? 33.3 : percentageScale * wins} color="teal">
          <Progress.Label style={{ fontSize: fontSizeInPixels }}>
            {`${wins.toFixed(0)}`}
          </Progress.Label>
        </Progress.Section>
        <Progress.Section value={empty ? 33.3 : percentageScale * draws} color="orange">
          <Progress.Label style={{ fontSize: fontSizeInPixels }}>
            {`${draws.toFixed(0)}`}
          </Progress.Label>
        </Progress.Section>
        <Progress.Section value={empty ? 33.3 : percentageScale * losses} color="red">
          <Progress.Label style={{ fontSize: fontSizeInPixels }}>
            {`${losses.toFixed(0)}`}
          </Progress.Label>
        </Progress.Section>
      </Progress.Root>
    </>
  );
}
