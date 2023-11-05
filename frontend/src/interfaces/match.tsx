import assert from 'assert';

import { Court } from './court';
import { getPositionName } from './stage_item_input';
import { TeamInterface } from './team';

export interface MatchInterface {
  id: number;
  round_id: number;
  created: string;
  team1_score: number;
  team2_score: number;
  team1: TeamInterface | null;
  team2: TeamInterface | null;
  team1_winner_from_stage_item_id: number | null;
  team1_winner_position_in_stage_item: number | null;
  team2_winner_from_stage_item_id: number | null;
  team2_winner_position_in_stage_item: number | null;
  team1_winner_from_match_id: number | null;
  team2_winner_from_match_id: number | null;
  court_id: number | null;
  court: Court | null;
}

export interface MatchBodyInterface {
  id: number;
  round_id: number;
  team1_score: number;
  team2_score: number;
  court_id: number | null;
}

export interface UpcomingMatchInterface {
  is_recommended: boolean;
  team1: TeamInterface;
  team2: TeamInterface;
  elo_diff: number;
  swiss_diff: number;
}

export interface MatchCreateBodyInterface {
  round_id: number;
  team1_id: number;
  team2_id: number;
  label: string;
}

export interface SchedulerSettings {
  eloThreshold: number;
  setEloThreshold: any;
  limit: number;
  setLimit: any;
  iterations: number;
  setIterations: any;
  onlyBehindSchedule: string;
  setOnlyBehindSchedule: any;
}

export function formatMatchTeam1(
  stageItemsLookup: any,
  matchesLookup: any,
  match: MatchInterface
): string {
  if (match.team1 != null) return match.team1.name;
  if (match.team1_winner_from_stage_item_id != null) {
    assert(match.team1_winner_position_in_stage_item != null);
    return `${getPositionName(match.team1_winner_position_in_stage_item)} of ${
      stageItemsLookup[match.team1_winner_from_stage_item_id].name
    }`;
  }
  assert(match.team1_winner_from_match_id != null);
  const winner = matchesLookup[match.team1_winner_from_match_id];
  const match_1 = formatMatchTeam1(stageItemsLookup, matchesLookup, winner);
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const match_2 = formatMatchTeam2(stageItemsLookup, matchesLookup, winner);
  return `Winner of match ${match_1} - ${match_2}`;
}

export function formatMatchTeam2(
  stageItemsLookup: any,
  matchesLookup: any,
  match: MatchInterface
): string {
  if (match.team2 != null) return match.team2.name;
  if (match.team2_winner_from_stage_item_id != null) {
    assert(match.team2_winner_position_in_stage_item != null);
    return `${getPositionName(match.team2_winner_position_in_stage_item)} of ${
      stageItemsLookup[match.team2_winner_from_stage_item_id].name
    }`;
  }
  assert(match.team2_winner_from_match_id != null);
  const winner = matchesLookup[match.team2_winner_from_match_id];
  const match_1 = formatMatchTeam1(stageItemsLookup, matchesLookup, winner);
  const match_2 = formatMatchTeam2(stageItemsLookup, matchesLookup, winner);
  return `Winner of match ${match_1} - ${match_2}`;
}
