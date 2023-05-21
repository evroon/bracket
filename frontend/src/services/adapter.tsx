import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse } from 'swr';

import { SchedulerSettings } from '../interfaces/match';
import { getLogin } from './local_storage';

const axios = require('axios').default;

export function handleRequestError(response: any) {
  if (response.response != null && response.response.data.detail != null) {
    showNotification({
      color: 'red',
      title: 'An error occurred',
      message: response.response.data.detail.toString(),
    });
  }
}

export function checkForAuthError(response: any) {
  // if (localStorage)
  //     console.error('asdasd', localStorage.getItem('login'), response.error);
  if (
    response.error != null &&
    response.error.response != null &&
    response.error.response.status === 401
  ) {
    const router = useRouter();
    router.push('/login');
  }
}

export function getBaseApiUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL != null
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : 'http://localhost:8400';
}

export function createAxios() {
  const user = getLogin();
  const access_token = user != null ? user.access_token : '';
  return axios.create({
    baseURL: getBaseApiUrl(),
    headers: {
      Authorization: `bearer ${access_token}`,
      Accept: 'application/json',
    },
  });
}

const fetcher = (url: string) =>
  createAxios()
    .get(url)
    .then((res: { data: any }) => res.data);

export function getClubs(): SWRResponse {
  return useSWR('clubs', fetcher);
}

export function getTournament(tournament_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}`, fetcher);
}

export function getTournaments(): SWRResponse {
  return useSWR('tournaments', fetcher);
}

export function getPlayers(tournament_id: number, not_in_team: boolean = false): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/players?not_in_team=${not_in_team}`, fetcher);
}

export function getTeams(tournament_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/teams`, fetcher);
}

export function getStages(tournament_id: number, no_draft_rounds: boolean = false): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/stages?no_draft_rounds=${no_draft_rounds}`, fetcher, {
    refreshInterval: 3000,
  });
}

export function getUser(user_id: number): SWRResponse {
  return useSWR(`users/${user_id}`, fetcher);
}

export function getUpcomingMatches(
  tournament_id: number,
  round_id: number,
  schedulerSettings: SchedulerSettings
): SWRResponse {
  return useSWR(
    `tournaments/${tournament_id}/rounds/${round_id}/upcoming_matches?elo_diff_threshold=${schedulerSettings.eloThreshold}&only_behind_schedule=${schedulerSettings.onlyBehindSchedule}&limit=${schedulerSettings.limit}&iterations=${schedulerSettings.iterations}`,
    fetcher
  );
}

export async function uploadLogo(tournament_id: number, file: any) {
  const bodyFormData = new FormData();
  bodyFormData.append('file', file, file.name);

  return createAxios().post(`tournaments/${tournament_id}/logo`, bodyFormData);
}
