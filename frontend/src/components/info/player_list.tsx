import { Text } from '@mantine/core';

import { TeamInterface } from '../../interfaces/team';

export default function PlayerList({ team }: { team: TeamInterface }) {
  const getPlayerNames = () =>
    team.players
      .map((p) => p.name)
      .sort()
      .join(', ') || '-';

  return (
    <Text lineClamp={1} title={getPlayerNames()}>
      {getPlayerNames()}
    </Text>
  );
}
