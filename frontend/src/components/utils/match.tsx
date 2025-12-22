import { MatchWithDetails } from '@openapi';
import dayjs from 'dayjs';
import { formatStageItemInput } from './stage_item_input';
import { Translator } from './types';

export interface SchedulerSettings {
  eloThreshold: number;
  setEloThreshold: any;
  limit: number;
  setLimit: any;
  iterations: number;
  setIterations: any;
  onlyRecommended: string;
  setOnlyRecommended: any;
}

export function getMatchStartTime(match: MatchWithDetails) {
  return dayjs(match.start_time || '');
}

export function getMatchEndTime(match: MatchWithDetails) {
  return getMatchStartTime(match).add(
    60 * (match.duration_minutes + match.margin_minutes),
    'second'
  );
}

export function isMatchHappening(match: MatchWithDetails) {
  return getMatchStartTime(match) < dayjs() && getMatchEndTime(match) > dayjs();
}

export function isMatchInTheFutureOrPresent(match: MatchWithDetails) {
  return getMatchEndTime(match) > dayjs();
}

export function isMatchInTheFuture(match: MatchWithDetails) {
  return getMatchStartTime(match) > dayjs();
}

export function formatMatchInput1(
  t: Translator,
  stageItemsLookup: any,
  matchesLookup: any,
  match: MatchWithDetails
): string {
  const formatted = formatStageItemInput(match.stage_item_input1, stageItemsLookup);
  if (formatted != null) return formatted;

  if (match.stage_item_input1_winner_from_match_id == null) {
    return t('empty_slot');
  }
  const winner = matchesLookup[match.stage_item_input1_winner_from_match_id].match;
  const match_1 = formatMatchInput1(t, stageItemsLookup, matchesLookup, winner);
  const match_2 = formatMatchInput2(t, stageItemsLookup, matchesLookup, winner);
  return `Winner of match ${match_1} - ${match_2}`;
}

export function formatMatchInput2(
  t: Translator,
  stageItemsLookup: any,
  matchesLookup: any,
  match: MatchWithDetails
): string {
  const formatted = formatStageItemInput(match.stage_item_input2, stageItemsLookup);
  if (formatted != null) return formatted;

  if (match.stage_item_input2_winner_from_match_id == null) {
    return t('empty_slot');
  }
  const winner = matchesLookup[match.stage_item_input2_winner_from_match_id].match;
  const match_1 = formatMatchInput1(t, stageItemsLookup, matchesLookup, winner);
  const match_2 = formatMatchInput2(t, stageItemsLookup, matchesLookup, winner);
  return `Winner of match ${match_1} - ${match_2}`;
}
