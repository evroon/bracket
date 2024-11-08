import { Translator } from '../components/utils/types';
import { Court } from './court';
import { StageItemInput, formatStageItemInput } from './stage_item_input';

export interface MatchInterface {
  id: number;
  round_id: number;
  created: string;
  stage_item_input1_score: number;
  stage_item_input2_score: number;
  stage_item_input1: StageItemInput | null;
  stage_item_input2: StageItemInput | null;
  stage_item_input1_winner_from_match_id: number | null;
  stage_item_input2_winner_from_match_id: number | null;
  court_id: number | null;
  court: Court | null;
  start_time: string;
  position_in_schedule: number | null;
  duration_minutes: number;
  margin_minutes: number;
  custom_duration_minutes: number | null;
  custom_margin_minutes: number | null;
  stage_item_input1_conflict: boolean;
  stage_item_input2_conflict: boolean;
}

export interface MatchBodyInterface {
  id: number;
  round_id: number;
  stage_item_input1_score: number;
  stage_item_input2_score: number;
  court_id: number | null;
  custom_duration_minutes: number | null;
  custom_margin_minutes: number | null;
}

export interface MatchRescheduleInterface {
  new_court_id: number;
  new_position: number;
  old_court_id: number;
  old_position: number;
}

export interface UpcomingMatchInterface {
  is_recommended: boolean;
  stage_item_input1: StageItemInput;
  stage_item_input2: StageItemInput;
  elo_diff: number;
  swiss_diff: number;
}

export interface MatchCreateBodyInterface {
  round_id: number;
  stage_item_input1_id: number;
  stage_item_input2_id: number;
  label: string;
}

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

export function getMatchStartTime(match: MatchInterface) {
  return new Date(match.start_time);
}

export function getMatchEndTime(match: MatchInterface) {
  return new Date(
    getMatchStartTime(match).getTime() + 60000 * (match.duration_minutes + match.margin_minutes)
  );
}

export function isMatchHappening(match: MatchInterface) {
  return getMatchStartTime(match) < new Date() && getMatchEndTime(match) > new Date();
}

export function isMatchInTheFutureOrPresent(match: MatchInterface) {
  return getMatchEndTime(match) > new Date();
}

export function isMatchInTheFuture(match: MatchInterface) {
  return getMatchStartTime(match) > new Date();
}

export function formatMatchInput1(
  t: Translator,
  stageItemsLookup: any,
  matchesLookup: any,
  match: MatchInterface
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
  match: MatchInterface
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
