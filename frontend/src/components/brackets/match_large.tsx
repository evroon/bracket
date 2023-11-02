import { Grid, UnstyledButton, createStyles, useMantineTheme } from '@mantine/core';
import assert from 'assert';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { MatchInterface } from '../../interfaces/match';
import { TournamentMinimal } from '../../interfaces/tournament';
import MatchModal from '../modals/match_modal';
import { MatchBadge } from './match';

const useStyles = createStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: '30px',
    padding: '0px',
    fontSize: '2rem',
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

export default function MatchLarge({
  swrRoundsResponse,
  swrCourtsResponse,
  swrUpcomingMatchesResponse,
  tournamentData,
  match,
  readOnly,
}: {
  swrRoundsResponse: SWRResponse | null;
  swrCourtsResponse: SWRResponse | null;
  swrUpcomingMatchesResponse: SWRResponse | null;
  tournamentData: TournamentMinimal;
  match: MatchInterface;
  readOnly: boolean;
}) {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const winner_style = {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.green[9] : theme.colors.green[4],
  };
  const team1_style = match.team1_score > match.team2_score ? winner_style : {};
  const team2_style = match.team1_score < match.team2_score ? winner_style : {};

  const team1_players = match.team1.players.map((player) => player.name).join(', ');
  const team2_players = match.team2.players.map((player) => player.name).join(', ');

  const team1_players_label = team1_players === '' ? 'No players' : team1_players;
  const team2_players_label = team2_players === '' ? 'No players' : team2_players;

  const [opened, setOpened] = useState(false);

  const bracket = (
    <>
      <MatchBadge match={match} theme={theme} />
      <div className={classes.top} style={team1_style}>
        <Grid grow>
          <Grid.Col span={10}>{team1_players_label}</Grid.Col>
          <Grid.Col span={2}>{match.team1_score}</Grid.Col>
        </Grid>
      </div>
      <div className={classes.divider} />
      <div className={classes.bottom} style={team2_style}>
        <Grid grow>
          <Grid.Col span={10}>{team2_players_label}</Grid.Col>
          <Grid.Col span={2}>{match.team2_score}</Grid.Col>
        </Grid>
      </div>
    </>
  );

  if (readOnly) {
    return <div className={classes.root}>{bracket}</div>;
  }
  assert(swrRoundsResponse != null);
  assert(swrCourtsResponse != null);

  return (
    <>
      <UnstyledButton className={classes.root} onClick={() => setOpened(!opened)}>
        {bracket}
      </UnstyledButton>
      <MatchModal
        swrRoundsResponse={swrRoundsResponse}
        swrCourtsResponse={swrCourtsResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        tournamentData={tournamentData}
        match={match}
        opened={opened}
        setOpened={setOpened}
        dynamicSchedule={false}
      />
    </>
  );
}
