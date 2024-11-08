import { Text } from '@mantine/core';

import { TeamInterface } from '../../interfaces/team';

export default function PlayerList({ team }: { team: TeamInterface }) {
  return <Text inherit>{team.name}</Text>;
}
