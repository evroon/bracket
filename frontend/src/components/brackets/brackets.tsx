import { Center, Title } from '@mantine/core';
import Game from './game';

export default function Brackets() {
  return (
    <div style={{ width: 250, height: 200 }}>
      <Center>
        <Title order={3}>Round 1</Title>
      </Center>
      <Game />
      <Game />
      <Game />
      <Game />
    </div>
  );
}
