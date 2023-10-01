import { SWRResponse } from 'swr';

import { RoundInterface } from './round';

export interface StageWithRounds {
  id: number;
  tournament_id: number;
  created: string;
  type: string;
  type_name: string;
  is_active: boolean;
  rounds: RoundInterface[];
}

export function getActiveStage(swrStagesResponse: SWRResponse) {
  return swrStagesResponse.data.data.filter((stage: StageWithRounds) => stage.is_active)[0];
}

export function getActiveRound(stage: StageWithRounds) {
  return stage.rounds.filter((round: RoundInterface) => round.is_active)[0];
}
