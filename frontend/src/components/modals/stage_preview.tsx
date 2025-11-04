import { Container } from '@mantine/core';

export function PreviewRoundRobinGroup({
  i,
  teams_per_group,
}: {
  i: number;
  teams_per_group: number;
}) {
  const teams = Array.from(Array(teams_per_group)).map((j) => (
    <div
      key={j}
      style={{
        width: '100%',
        backgroundColor: '#6725ae',
        height: '12px',
        marginTop: '4px',
        marginBottom: '4px',
        borderRadius: '4px',
      }}
    />
  ));
  return (
    <div
      key={i}
      style={{
        width: '100%',
        backgroundColor: '#ddd',
        padding: '4px 8px',
        marginTop: '8px',
        marginBottom: '8px',
        borderRadius: '8px',
        justifyContent: 'space-between',
        gap: '8px',
      }}
    >
      {teams}
    </div>
  );
}

export function StagePreviewRoundRobin({
  group_count,
  teams_per_group,
}: {
  group_count: number;
  teams_per_group: number;
}) {
  const preview = Array.from(Array(group_count)).map((i) => (
    <PreviewRoundRobinGroup i={i} teams_per_group={teams_per_group} />
  ));
  return <Container>{preview}</Container>;
}
