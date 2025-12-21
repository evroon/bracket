import { Center, Grid, Title } from '@mantine/core';
import { SWRResponse } from 'swr';

import RoundModal from '@components/modals/round_modal';
import { BracketDisplaySettings } from '@components/utils/brackets';
import { isMatchHappening, isMatchInTheFutureOrPresent } from '@components/utils/match';
import { TournamentMinimal } from '@components/utils/tournament';
import { MatchWithDetails, RoundWithMatches, StagesWithStageItemsResponse } from '@openapi';
import Match from './match';

export default function RoundComponent({
  tournamentData,
  round,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
  displaySettings,
}: {
  tournamentData: TournamentMinimal;
  round: RoundWithMatches;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse | null;
  readOnly: boolean;
  displaySettings: BracketDisplaySettings;
}) {
  const matches = round.matches
    .sort((m1, m2) =>
      (m1.court ? m1.court.name : 'y') > (m2.court ? m2.court.name : 'z') ? 1 : -1
    )
    .filter(
      (match: MatchWithDetails) =>
        displaySettings.matchVisibility === 'all' ||
        (displaySettings.matchVisibility === 'future-only' && isMatchInTheFutureOrPresent(match)) ||
        (displaySettings.matchVisibility === 'present-only' && isMatchHappening(match))
    )
    .map((match) => (
      <Match
        key={match.id}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        match={match}
        readOnly={readOnly}
        round={round}
      />
    ));
  const active_round_style = round.is_draft
    ? {
        borderStyle: 'dashed',
        borderColor: 'gray',
      }
    : {
        borderStyle: 'solid',
        borderColor: 'gray',
      };

  const modal = readOnly ? (
    <Title order={3}>{round.name}</Title>
  ) : (
    <RoundModal
      tournamentData={tournamentData}
      round={round}
      swrStagesResponse={swrStagesResponse}
      swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
    />
  );

  if (matches.length === 0 && displaySettings.matchVisibility !== 'all') {
    return null;
  }

  const item = (
    <div
      style={{
        height: '100%',
        minHeight: 320,
        padding: '15px',
        borderRadius: '20px',
        ...active_round_style,
      }}
    >
      <Center>{modal}</Center>
      {matches}
    </div>
  );

  if (readOnly) {
    return (
      <Grid.Col
        style={{ minHeight: 320, maxWidth: 500, marginRight: '1rem', marginBottom: '1rem' }}
      >
        {item}
      </Grid.Col>
    );
  }

  return (
    <div style={{ minHeight: 320, width: 400, marginRight: '1rem', marginBottom: '1rem' }}>
      {item}
    </div>
  );
}
