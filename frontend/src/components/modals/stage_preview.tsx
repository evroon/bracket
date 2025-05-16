import { Container } from '@mantine/core';

export function PreviewRoundRobinGroup({
  i,
  teams_per_group,
}: {
  i: number;
  teams_per_group: number;
}) {
  const teams = [...Array(teams_per_group).keys()].map((j) => (
    <div key={j} style={{ width: '100%', backgroundColor: '#333', height: '16px' }} />
  ));
  return (
    <div
      key={i}
      style={{
        width: '100%',
        backgroundColor: '#ddd',
        padding: '16px',
        marginTop: '8px',
        borderRadius: '8px',
      justifyContent: 'space-between',
      gap: '8px'
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
  const preview = [...Array(5).keys()].map((i) => (
    <PreviewRoundRobinGroup i={i} teams_per_group={teams_per_group} />
  ));
  return <Container>{preview}</Container>;
}
