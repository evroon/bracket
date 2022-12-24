import { Center, Title } from '@mantine/core';

import { RoundInterface } from '../../interfaces/round';
import Game from './game';

export default function Round({ round }: { round: RoundInterface }) {
  const games = round.matches.map((match) => <Game key={match.id} match={match} />);
  const active_round_style = round.is_active
    ? {
        borderStyle: 'solid',
        borderColor: 'green',
      }
    : round.is_draft
    ? {
        borderStyle: 'dashed',
        borderColor: 'gray',
      }
    : {};
  const active_round_header = round.is_active ? (
    <Center>
      <h3 style={{ color: 'green' }}>Active round</h3>
    </Center>
  ) : (
    ''
  );
  const draft_round_header = round.is_draft ? (
    <Center>
      <h3 style={{ color: 'gray' }}>Draft round</h3>
    </Center>
  ) : (
    ''
  );

  return (
    <div style={{ width: 300, marginLeft: '50px', minHeight: 500 }}>
      <div
        style={{
          height: '100%',
          minHeight: 500,
          padding: '15px',
          borderRadius: '20px',
          ...active_round_style,
        }}
      >
        <Center>
          <Title order={3}>Round {round.round_index}</Title>
        </Center>
        {games}
      </div>
      {active_round_header}
      {draft_round_header}
    </div>
  );
}
