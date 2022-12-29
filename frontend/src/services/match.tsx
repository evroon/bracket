import { MatchBodyInterface, MatchInterface } from '../interfaces/match';
import { createAxios } from './adapter';

export async function createMatch(tournament_id: number, match: MatchInterface) {
  return createAxios().post(`tournaments/${tournament_id}/matches`, match);
}

export async function deleteMatch(tournament_id: number, match_id: number) {
  return createAxios().delete(`tournaments/${tournament_id}/matches/${match_id}`);
}

export async function updateMatch(
  tournament_id: number,
  match_id: number,
  match: MatchBodyInterface
) {
  return createAxios().patch(`tournaments/${tournament_id}/matches/${match_id}`, match);
}
