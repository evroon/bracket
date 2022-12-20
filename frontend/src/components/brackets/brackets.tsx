import { Group } from '@mantine/core';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import Round from './round';

export default function Brackets({ swrRoundsResponse }: { swrRoundsResponse: SWRResponse }) {
  if (swrRoundsResponse.data == null) {
    return <div />;
  }

  const rounds = swrRoundsResponse.data.data.map((round: RoundInterface) => (
    <Round round={round} />
  ));
  return <Group>{rounds}</Group>;
}
