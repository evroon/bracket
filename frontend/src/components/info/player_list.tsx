import { Text } from '@mantine/core';

import { FullTeamWithPlayers } from '@openapi';

export default function PlayerList({ team }: { team: FullTeamWithPlayers }) {
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
