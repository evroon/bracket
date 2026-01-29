import { Box, Stack, Title } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import MatchModal from '@components/modals/match_modal';
import { Time } from '@components/utils/datetime';
import { formatMatchInput1, formatMatchInput2 } from '@components/utils/match';
import { TournamentMinimal } from '@components/utils/tournament';
import {
  MatchWithDetails,
  RoundWithMatches,
  StageItemWithRounds,
  StagesWithStageItemsResponse,
  UpcomingMatchesResponse,
} from '@openapi';
import { getMatchLookup, getStageItemLookup } from '@services/lookups';
import classes from './graphical_bracket.module.css';

type BracketPosition = 'WINNERS' | 'LOSERS' | 'GRAND_FINALS' | 'NONE';

interface RoundWithMatchesExtended extends RoundWithMatches {
  bracket_position?: BracketPosition;
}

function MatchBox({
  match,
  round,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
}: {
  match: MatchWithDetails;
  round: RoundWithMatches;
  tournamentData: TournamentMinimal;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse> | null;
  readOnly: boolean;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const stageItemsLookup = getStageItemLookup(swrStagesResponse);
  const matchesLookup = getMatchLookup(swrStagesResponse);

  const team1Label = formatMatchInput1(t, stageItemsLookup, matchesLookup, match);
  const team2Label = formatMatchInput2(t, stageItemsLookup, matchesLookup, match);

  const team1Wins = match.stage_item_input1_score > match.stage_item_input2_score;
  const team2Wins = match.stage_item_input2_score > match.stage_item_input1_score;

  const isBye = !team1Label || !team2Label || team1Label === 'TBD' || team2Label === 'TBD';

  const handleClick = () => {
    if (!readOnly) {
      setOpened(true);
    }
  };

  return (
    <>
      <div
        className={`${classes.matchBox} ${readOnly ? classes.matchBoxReadOnly : ''} ${isBye ? classes.byeMatch : ''}`}
        onClick={handleClick}
      >
        {match.start_time && (
          <div className={classes.matchTime}>
            {match.court?.name && `${match.court.name} | `}
            <Time datetime={match.start_time} />
          </div>
        )}
        <div className={`${classes.team} ${classes.teamTop} ${team1Wins ? classes.teamWinner : ''}`}>
          <span className={classes.teamName}>{team1Label || 'BYE'}</span>
          <span className={classes.teamScore}>{match.stage_item_input1_score}</span>
        </div>
        <div className={classes.teamDivider} />
        <div
          className={`${classes.team} ${classes.teamBottom} ${team2Wins ? classes.teamWinner : ''}`}
        >
          <span className={classes.teamName}>{team2Label || 'BYE'}</span>
          <span className={classes.teamScore}>{match.stage_item_input2_score}</span>
        </div>
      </div>
      {!readOnly && (
        <MatchModal
          swrStagesResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          tournamentData={tournamentData}
          match={match}
          opened={opened}
          setOpened={setOpened}
          round={round}
        />
      )}
    </>
  );
}

function BracketRound({
  round,
  roundIndex,
  totalRounds,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
}: {
  round: RoundWithMatches;
  roundIndex: number;
  totalRounds: number;
  tournamentData: TournamentMinimal;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse> | null;
  readOnly: boolean;
}) {
  // Calculate spacing multiplier based on round (doubles each round for proper bracket alignment)
  const spacingMultiplier = Math.pow(2, roundIndex);
  const matchSpacing = 60 * spacingMultiplier;

  return (
    <div className={classes.round}>
      <div className={classes.roundTitle}>{round.name}</div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${matchSpacing}px`,
          paddingTop: `${(matchSpacing - 60) / 2}px`,
        }}
      >
        {round.matches.map((match) => (
          <div key={match.id} className={classes.matchWrapper}>
            <MatchBox
              match={match}
              round={round}
              tournamentData={tournamentData}
              swrStagesResponse={swrStagesResponse}
              swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketSection({
  title,
  rounds,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
}: {
  title: string;
  rounds: RoundWithMatches[];
  tournamentData: TournamentMinimal;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse> | null;
  readOnly: boolean;
}) {
  if (rounds.length === 0) {
    return null;
  }

  return (
    <Box>
      <Title order={4} className={classes.sectionTitle}>
        {title}
      </Title>
      <div className={classes.bracketContainer}>
        <div className={classes.bracket}>
          {rounds.map((round, index) => (
            <BracketRound
              key={round.id}
              round={round}
              roundIndex={index}
              totalRounds={rounds.length}
              tournamentData={tournamentData}
              swrStagesResponse={swrStagesResponse}
              swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </Box>
  );
}

export function GraphicalBracket({
  stageItem,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
}: {
  stageItem: StageItemWithRounds;
  tournamentData: TournamentMinimal;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse> | null;
  readOnly: boolean;
}) {
  const { t } = useTranslation();

  const filterRoundsByBracketPosition = (position: BracketPosition): RoundWithMatches[] => {
    return stageItem.rounds
      .filter((r) => (r as RoundWithMatchesExtended).bracket_position === position)
      .sort((r1, r2) => (r1.name > r2.name ? 1 : -1));
  };

  const winnersRounds = filterRoundsByBracketPosition('WINNERS');
  const losersRounds = filterRoundsByBracketPosition('LOSERS');
  const grandFinalsRounds = filterRoundsByBracketPosition('GRAND_FINALS');

  // For single elimination (no bracket positions set), show all rounds as one bracket
  const noneRounds = filterRoundsByBracketPosition('NONE');
  const isSingleElimination =
    noneRounds.length > 0 &&
    winnersRounds.length === 0 &&
    losersRounds.length === 0 &&
    grandFinalsRounds.length === 0;

  if (isSingleElimination) {
    return (
      <BracketSection
        title={t('bracket')}
        rounds={noneRounds}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
      />
    );
  }

  return (
    <Stack gap="xl">
      <BracketSection
        title={t('winners_bracket')}
        rounds={winnersRounds}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
      />

      <BracketSection
        title={t('losers_bracket')}
        rounds={losersRounds}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
      />

      {grandFinalsRounds.length > 0 && (
        <Box className={classes.grandFinals}>
          <BracketSection
            title={t('grand_finals')}
            rounds={grandFinalsRounds}
            tournamentData={tournamentData}
            swrStagesResponse={swrStagesResponse}
            swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
            readOnly={readOnly}
          />
        </Box>
      )}
    </Stack>
  );
}
