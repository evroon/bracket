import { Progress } from '@mantine/core';

interface ScoreProps {
  score: number;
  min_score: number;
  max_score: number;
  decimals: number;
  fontSizeInPixels: number;
}

export function PlayerScore({
  score,
  min_score,
  max_score,
  decimals,
  fontSizeInPixels,
}: ScoreProps) {
  const percentageScale = 100.0 / (max_score - min_score);
  const empty = max_score - min_score === 0;

  return (
    <Progress.Root size={fontSizeInPixels * 1.5}>
      <Progress.Section value={empty ? 50 : percentageScale * (score - min_score)} color="indigo">
        <Progress.Label style={{ fontSize: fontSizeInPixels }}>
          {Number(score).toFixed(decimals)}
        </Progress.Label>
      </Progress.Section>
    </Progress.Root>
  );
}
