import { Center, Title } from '@mantine/core';

import { RoundInterface } from '../../interfaces/round';
import Game from './game';

export default function Round({ round }: { round: RoundInterface }) {
  return (
    <div style={{ width: 250, height: 200, marginLeft: '50px' }}>
      <Center>
        <Title order={3}>Round {round.round_index}</Title>
      </Center>
      <Game />
      <Game />
      <Game />
      <Game />
    </div>
  );
}
