import { Center, Grid, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import assert from 'assert';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import {
  MatchInterface,
  formatMatchInput1,
  formatMatchInput2,
  isMatchHappening,
} from '../../interfaces/match';
import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import { getMatchLookup, getStageItemLookup } from '../../services/lookups';
import MatchModal from '../modals/match_modal';
import { Time } from '../utils/datetime';
import classes from './match.module.css';

export function MatchBadge({ match, theme }: { match: MatchInterface; theme: any }) {
  const visibility = match.court ? 'visible' : 'hidden';
  const badgeColor = useColorScheme() ? theme.colors.blue[7] : theme.colors.blue[7];
  return (
    <Center style={{ transform: 'translateY(0%)', visibility }}>
      <div
        style={{
          width: '75%',
          backgroundColor: isMatchHappening(match) ? theme.colors.grape[9] : badgeColor,
          borderRadius: '8px 8px 0px 0px',
          padding: '4px 12px 4px 12px',
        }}
      >
        <Center>
          <b>
            {match.court?.name} |{' '}
            {match.start_time != null ? <Time datetime={match.start_time} /> : null}
          </b>
        </Center>
      </div>
    </Center>
  );
}

export default function Match({
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  tournamentData,
  match,
  readOnly,
  round,
}: {
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  tournamentData: TournamentMinimal;
  match: MatchInterface;
  readOnly: boolean;

  round: RoundInterface;
}) {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const winner_style = {
    backgroundColor: theme.colors.green[9],
  };

  const stageItemsLookup = getStageItemLookup(swrStagesResponse);
  const matchesLookup = getMatchLookup(swrStagesResponse);

  const team1_style =
    match.stage_item_input1_score > match.stage_item_input2_score ? winner_style : {};
  const team2_style =
    match.stage_item_input1_score < match.stage_item_input2_score ? winner_style : {};

  const team1_label = formatMatchInput1(t, stageItemsLookup, matchesLookup, match);
  const team2_label = formatMatchInput2(t, stageItemsLookup, matchesLookup, match);

  const [opened, setOpened] = useState(false);

  const bracket = (
    <>
      <MatchBadge match={match} theme={theme} />
      <div className={classes.top} style={team1_style}>
        <Grid grow>
          <Grid.Col span={10}>{team1_label}</Grid.Col>
          <Grid.Col span={2}>{match.stage_item_input1_score}</Grid.Col>
        </Grid>
      </div>
      <div className={classes.divider} />
      <div className={classes.bottom} style={team2_style}>
        <Grid grow>
          <Grid.Col span={10}>{team2_label}</Grid.Col>
          <Grid.Col span={2}>{match.stage_item_input2_score}</Grid.Col>
        </Grid>
      </div>
    </>
  );

  if (readOnly) {
    return <div className={classes.root}>{bracket}</div>;
  }
  assert(swrStagesResponse != null);

  return (
    <>
      <UnstyledButton className={classes.root} onClick={() => setOpened(!opened)}>
        {bracket}
      </UnstyledButton>
      <MatchModal
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        tournamentData={tournamentData}
        match={match}
        opened={opened}
        setOpened={setOpened}
        round={round}
      />
    </>
  );
}
