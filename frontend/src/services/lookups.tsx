import { SWRResponse } from 'swr';

import { responseIsValid } from '../components/utils/util';
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
