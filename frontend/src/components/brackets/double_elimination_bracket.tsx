import { Divider, Group, Stack, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import { BracketDisplaySettings } from '@components/utils/brackets';
import {
  RoundWithMatches,
  StageItemWithRounds,
  StagesWithStageItemsResponse,
  Tournament,
  UpcomingMatchesResponse,
} from '@openapi';
import RoundComponent from './round';

// Bracket position enum - will be in OpenAPI types after regeneration
type BracketPosition = 'WINNERS' | 'LOSERS' | 'GRAND_FINALS' | 'NONE';

// Extended round type with bracket_position - will be in OpenAPI types after regeneration
interface RoundWithMatchesExtended extends RoundWithMatches {
  bracket_position?: BracketPosition;
}

function filterRoundsByBracketPosition(
  rounds: RoundWithMatches[],
  position: BracketPosition
): RoundWithMatches[] {
  return rounds
    .filter((r) => (r as RoundWithMatchesExtended).bracket_position === position)
    .sort((r1, r2) => (r1.name > r2.name ? 1 : -1));
}

function BracketSection({
  title,
  rounds,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
  displaySettings,
}: {
  title: string;
  rounds: RoundWithMatches[];
  tournamentData: Tournament;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse>;
  readOnly: boolean;
  displaySettings: BracketDisplaySettings;
}) {
  if (rounds.length === 0) {
    return null;
  }

  return (
    <Stack gap="md">
      <Title order={4} c="dimmed">
        {title}
      </Title>
      <Group align="top" gap="md">
        {rounds.map((round) => (
          <RoundComponent
            key={round.id}
            tournamentData={tournamentData}
            round={round}
            swrStagesResponse={swrStagesResponse}
            swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
            readOnly={readOnly}
            displaySettings={displaySettings}
          />
        ))}
      </Group>
    </Stack>
  );
}

export function DoubleEliminationBracket({
  stageItem,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
  displaySettings,
}: {
  stageItem: StageItemWithRounds;
  tournamentData: Tournament;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse>;
  readOnly: boolean;
  displaySettings: BracketDisplaySettings;
}) {
  const { t } = useTranslation();

  const winnersRounds = filterRoundsByBracketPosition(stageItem.rounds, 'WINNERS');
  const losersRounds = filterRoundsByBracketPosition(stageItem.rounds, 'LOSERS');
  const grandFinalsRounds = filterRoundsByBracketPosition(stageItem.rounds, 'GRAND_FINALS');

  return (
    <Stack gap="xl">
      <BracketSection
        title={t('winners_bracket')}
        rounds={winnersRounds}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
        displaySettings={displaySettings}
      />

      {losersRounds.length > 0 && <Divider />}

      <BracketSection
        title={t('losers_bracket')}
        rounds={losersRounds}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
        displaySettings={displaySettings}
      />

      {grandFinalsRounds.length > 0 && <Divider />}

      <BracketSection
        title={t('grand_finals')}
        rounds={grandFinalsRounds}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
        displaySettings={displaySettings}
      />
    </Stack>
  );
}
