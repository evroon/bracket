import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse } from 'swr';

import { SchedulerSettings } from '../interfaces/match';
import { getLogin, performLogout, tokenPresent } from './local_storage';

const axios = require('axios').default;

export function handleRequestError(response: any) {
  if (response.code === 'ERR_NETWORK') {
    showNotification({
      color: 'red',
      title: 'An error occurred',
      message: 'Internal server error',
    });
  }

  if (response.response != null && response.response.data.detail != null) {
    // If the detail contains an array, there is likely a pydantic validation error occurring.
    const message = Array.isArray(response.response.data.detail)
      ? 'Unknown error'
      : response.response.data.detail.toString();

    showNotification({
      color: 'red',
      title: 'An error occurred',
      message,
    });
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

export function getTournamentByEndpointName(tournament_endpoint_name: string): SWRResponse {
  return useSWR(`tournaments?endpoint_name=${tournament_endpoint_name}`, fetcher);
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

export function getTeamsLive(tournament_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/teams`, fetcher, {
    refreshInterval: 5000,
  });
}

export function getAvailableStageItemInputs(tournament_id: number, stage_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/stages/${stage_id}/available_inputs`, fetcher);
}

export function getStages(tournament_id: number, no_draft_rounds: boolean = false): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/stages?no_draft_rounds=${no_draft_rounds}`, fetcher);
}

export function getStagesLive(
  tournament_id: number,
  no_draft_rounds: boolean = false
): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/stages?no_draft_rounds=${no_draft_rounds}`, fetcher, {
    refreshInterval: 5_000,
  });
}

export function getCourts(tournament_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/courts`, fetcher);
}

export function getCourtsLive(tournament_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/courts`, fetcher, {
    refreshInterval: 60_000,
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
    `tournaments/${tournament_id}/rounds/${round_id}/upcoming_matches?elo_diff_threshold=${schedulerSettings.eloThreshold}&only_recommended=${schedulerSettings.onlyRecommended}&limit=${schedulerSettings.limit}&iterations=${schedulerSettings.iterations}`,
    fetcher
  );
}

export async function uploadLogo(tournament_id: number, file: any) {
  const bodyFormData = new FormData();
  bodyFormData.append('file', file, file.name);

  return createAxios().post(`tournaments/${tournament_id}/logo`, bodyFormData);
}

export function checkForAuthError(response: any) {
  if (typeof window !== 'undefined' && !tokenPresent()) {
    const router = useRouter();
    router.push('/login');
  }

  // We send a simple GET `/clubs` request to test whether we really should log out. // Next
  // sometimes uses out-of-date local storage, so we send an additional request with up-to-date
  // local storage.
  // If that gives a 401, we log out.
  function responseHasAuthError(_response: any) {
    return (
      _response.error != null &&
      _response.error.response != null &&
      _response.error.response.status === 401
    );
  }
  if (responseHasAuthError(response)) {
    createAxios()
      .get('clubs')
      .then(() => {})
      .catch((error: any) => {
        if (error.toJSON().status === 401) {
          performLogout();
        }
      });
  }
}
