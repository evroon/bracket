import { Center, Grid, UnstyledButton, createStyles, useMantineTheme } from '@mantine/core';
import assert from 'assert';
import { Property } from 'csstype';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { BracketDisplaySettings } from '../../interfaces/brackets';
import {
  MatchInterface,
  formatMatchTeam1,
  formatMatchTeam2,
  isMatchHappening,
} from '../../interfaces/match';
import { TournamentMinimal } from '../../interfaces/tournament';
import { getMatchLookup, getStageItemLookup } from '../../services/lookups';
import MatchModal from '../modals/match_modal';
import { Time } from '../utils/datetime';

import Visibility = Property.Visibility;

const useStyles = createStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: '30px',
    padding: '0px',
  },
  divider: {
    backgroundColor: 'darkgray',
    height: '1px',
  },
  top: {
    // subscribe to color scheme changes right in your styles
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
    padding: '8px 8px 8px 15px',
    borderRadius: '8px 8px 0px 0px',
  },
  bottom: {
    // subscribe to color scheme changes right in your styles
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
    padding: '8px 8px 8px 15px',
    borderRadius: '0px 0px 8px 8px',
  },
}));

export function MatchBadge({ match, theme }: { match: MatchInterface; theme: any }) {
  const visibility: Visibility = match.court ? 'visible' : 'hidden';
  const badgeColor = theme.colorScheme === 'dark' ? theme.colors.blue[7] : theme.colors.blue[2];
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
  dynamicSchedule,
  displaySettings,
}: {
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  tournamentData: TournamentMinimal;
  match: MatchInterface;
  readOnly: boolean;
  dynamicSchedule: boolean;
  displaySettings?: BracketDisplaySettings | null;
}) {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const winner_style = {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.green[9] : theme.colors.green[4],
  };
  const showTeamMemberNames =
    displaySettings != null && displaySettings.teamNamesDisplay === 'player-names';

  const stageItemsLookup = getStageItemLookup(swrStagesResponse);
  const matchesLookup = getMatchLookup(swrStagesResponse);

  const team1_style = match.team1_score > match.team2_score ? winner_style : {};
  const team2_style = match.team1_score < match.team2_score ? winner_style : {};

  const team1_players = match.team1
    ? match.team1.players.map((player) => player.name).join(', ')
    : '';
  const team2_players = match.team2
    ? match.team2.players.map((player) => player.name).join(', ')
    : '';

  const team1_players_label = team1_players === '' ? 'No players' : team1_players;
  const team2_players_label = team2_players === '' ? 'No players' : team2_players;

  const team1_label = showTeamMemberNames
    ? team1_players_label
    : formatMatchTeam1(stageItemsLookup, matchesLookup, match);
  const team2_label = showTeamMemberNames
    ? team2_players_label
    : formatMatchTeam2(stageItemsLookup, matchesLookup, match);

  const [opened, setOpened] = useState(false);

  const bracket = (
    <>
      <MatchBadge match={match} theme={theme} />
      <div className={classes.top} style={team1_style}>
        <Grid grow>
          <Grid.Col span={10}>{team1_label}</Grid.Col>
          <Grid.Col span={2}>{match.team1_score}</Grid.Col>
        </Grid>
      </div>
      <div className={classes.divider} />
      <div className={classes.bottom} style={team2_style}>
        <Grid grow>
          <Grid.Col span={10}>{team2_label}</Grid.Col>
          <Grid.Col span={2}>{match.team2_score}</Grid.Col>
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
        dynamicSchedule={dynamicSchedule}
      />
    </>
  );
}
