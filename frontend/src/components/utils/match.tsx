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
  return getMatchStartTime(match).add(match.duration_minutes + match.margin_minutes, 'minutes');
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

function formatMatchReference(
  t: Translator,
  stageItemsLookup: any,
  matchesLookup: any,
  sourceMatchId: number,
  isLoser: boolean
): string {
  const entry = matchesLookup[sourceMatchId];
  const gameNum = entry?.gameNumber;
  const label = isLoser ? t('loser_of_match') : t('winner_of_match');
  if (gameNum != null) {
    return `${label} Game ${gameNum}`;
  }
  // Fallback to old behavior if no game number
  const sourceMatch = entry?.match;
  if (sourceMatch) {
    const match_1 = formatMatchInput1(t, stageItemsLookup, matchesLookup, sourceMatch);
    const match_2 = formatMatchInput2(t, stageItemsLookup, matchesLookup, sourceMatch);
    return `${label} ${match_1} - ${match_2}`;
  }
  return label;
}

export function formatMatchInput1(
  t: Translator,
  stageItemsLookup: any,
  matchesLookup: any,
  match: MatchWithDetails
): string {
  const formatted = formatStageItemInput(match.stage_item_input1, stageItemsLookup);
  if (formatted != null) return formatted;

  // Check for winner reference
  if (match.stage_item_input1_winner_from_match_id != null) {
    const sourceMatchId = match.stage_item_input1_winner_from_match_id;
    if (matchesLookup[sourceMatchId]) {
      return formatMatchReference(t, stageItemsLookup, matchesLookup, sourceMatchId, false);
    }
  }

  // Check for loser reference (double elimination)
  if ((match as any).stage_item_input1_loser_from_match_id != null) {
    const sourceMatchId = (match as any).stage_item_input1_loser_from_match_id;
    if (matchesLookup[sourceMatchId]) {
      return formatMatchReference(t, stageItemsLookup, matchesLookup, sourceMatchId, true);
    }
  }

  return t('empty_slot');
}

export function formatMatchInput2(
  t: Translator,
  stageItemsLookup: any,
  matchesLookup: any,
  match: MatchWithDetails
): string {
  const formatted = formatStageItemInput(match.stage_item_input2, stageItemsLookup);
  if (formatted != null) return formatted;

  // Check for winner reference
  if (match.stage_item_input2_winner_from_match_id != null) {
    const sourceMatchId = match.stage_item_input2_winner_from_match_id;
    if (matchesLookup[sourceMatchId]) {
      return formatMatchReference(t, stageItemsLookup, matchesLookup, sourceMatchId, false);
    }
  }

  // Check for loser reference (double elimination)
  if ((match as any).stage_item_input2_loser_from_match_id != null) {
    const sourceMatchId = (match as any).stage_item_input2_loser_from_match_id;
    if (matchesLookup[sourceMatchId]) {
      return formatMatchReference(t, stageItemsLookup, matchesLookup, sourceMatchId, true);
    }
  }

  return t('empty_slot');
}
