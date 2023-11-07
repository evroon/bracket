import assert from 'assert';
import { SWRResponse } from 'swr';

import { groupBy, responseIsValid } from '../components/utils/util';
import { Court } from '../interfaces/court';
import { MatchInterface } from '../interfaces/match';
import { RoundInterface } from '../interfaces/round';
import { StageWithStageItems } from '../interfaces/stage';
import { TeamInterface } from '../interfaces/team';
import { getTeams } from './adapter';

export function getTeamsLookup(tournamentId: number) {
  const swrTeamsResponse: SWRResponse = getTeams(tournamentId);
  const isResponseValid = responseIsValid(swrTeamsResponse);

  if (!isResponseValid) {
    return null;
  }
  return Object.fromEntries(swrTeamsResponse.data.data.map((x: TeamInterface) => [x.id, x]));
}

export function getStageItemLookup(swrStagesResponse: SWRResponse) {
  let result: any[] = [];

  swrStagesResponse.data.data.map((stage: StageWithStageItems) =>
    stage.stage_items.forEach((stage_item) => {
      result = result.concat([[stage_item.id, stage_item]]);
    })
  );
  return Object.fromEntries(result);
}

export function getMatchLookup(swrStagesResponse: SWRResponse) {
  let result: any[] = [];

  swrStagesResponse.data.data.map((stage: StageWithStageItems) =>
    stage.stage_items.forEach((stageItem) => {
      stageItem.rounds.forEach((round) => {
        round.matches.forEach((match) => {
          result = result.concat([[match.id, { match, stageItem }]]);
        });
      });
    })
  );
  return Object.fromEntries(result);
}

export function getMatchLookupByCourt(swrStagesResponse: SWRResponse) {
  const matches = Object.values(getMatchLookup(swrStagesResponse)).map((x) => x.match);
  return groupBy(['court_id'])(matches);
}

export function getScheduleData(
  swrCourtsResponse: SWRResponse,
  matchesByCourtId: any
): { court: Court; matches: MatchInterface[] }[] {
  return swrCourtsResponse.data.data.map((court: Court) => ({
    matches: (matchesByCourtId[court.id] || [])
      .filter((match: MatchInterface) => match.start_time != null)
      .sort((m1: MatchInterface, m2: MatchInterface) => {
        assert(m1.position_in_schedule != null);
        assert(m2.position_in_schedule != null);
        return m1.position_in_schedule > m2.position_in_schedule ? 1 : 0 || [];
      }),
    court,
  }));
}

export function getActiveRounds(swrStagesResponse: SWRResponse) {
  let result: RoundInterface[] = [];

  swrStagesResponse.data.data.map((stage: StageWithStageItems) =>
    stage.stage_items.forEach((stage_item) => {
      stage_item.rounds.forEach((round) => {
        if (round.is_active) result = result.concat([round]);
      });
    })
  );
  return result;
}
