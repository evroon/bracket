import { showNotification } from '@mantine/notifications';

import {
  MatchBodyInterface,
  MatchCreateBodyInterface,
  MatchRescheduleInterface,
} from '../interfaces/match';
import { createAxios, handleRequestError } from './adapter';

export async function createMatch(tournament_id: number, match: MatchCreateBodyInterface) {
  return createAxios()
    .post(`tournaments/${tournament_id}/matches`, match)
    .catch((response: any) => handleRequestError(response));
}

export async function deleteMatch(tournament_id: number, match_id: number) {
  return createAxios()
    .delete(`tournaments/${tournament_id}/matches/${match_id}`)
    .catch((response: any) => handleRequestError(response));
}

export async function updateMatch(
  tournament_id: number,
  match_id: number,
  match: MatchBodyInterface
) {
  return createAxios()
    .put(`tournaments/${tournament_id}/matches/${match_id}`, match)
    .catch((response: any) => handleRequestError(response));
}

export async function rescheduleMatch(
  tournament_id: number,
  match_id: number,
  match: MatchRescheduleInterface
) {
  return createAxios()
    .post(`tournaments/${tournament_id}/matches/${match_id}/reschedule`, match)
    .catch((response: any) => handleRequestError(response))
    .then((response: any) => {
      if (response != null && response.status === 200) {
        showNotification({
          color: 'green',
          title: 'Successfully rescheduled match',
          message: '',
        });
      }
    });
}

export async function scheduleMatches(tournament_id: number) {
  return createAxios()
    .post(`tournaments/${tournament_id}/schedule_matches`)
    .catch((response: any) => handleRequestError(response));
}
