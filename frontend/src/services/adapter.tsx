import { showNotification } from '@mantine/notifications';
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import type Axios from 'axios';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse } from 'swr';

import { Pagination } from '../components/utils/util';
import { SchedulerSettings } from '../interfaces/match';
import { getLogin, performLogout, tokenPresent } from './local_storage';

// TODO: This is a workaround for the fact that axios is not properly typed.
const axios: typeof Axios = require('axios').default;

export function handleRequestError(response: AxiosError) {
  if (response.code === 'ERR_NETWORK') {
    showNotification({
      color: 'red',
      title: 'An error occurred',
      message: 'Internal server error',
      autoClose: 10000,
    });
    return;
  }

  // @ts-ignore
  if (response.response != null && response.response.data.detail != null) {
    // If the detail contains an array, there is likely a pydantic validation error occurring.
    // @ts-ignore
    const { detail } = response.response.data;
    let message: string;

    if (Array.isArray(detail)) {
      const firstError = detail[0];
      message = `${firstError.loc.slice(1).join(' - ')}: ${firstError.msg}`;
    } else {
      message = detail.toString();
    }

    showNotification({
      color: 'red',
      title: 'An error occurred',
      message,
      autoClose: 10000,
    });
  }
}

export function requestSucceeded(result: AxiosResponse | AxiosError) {
  // @ts-ignore
  return result.name !== 'AxiosError';
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

export async function awaitRequestAndHandleError(
  requestFunction: (instance: AxiosInstance) => Promise<AxiosResponse>
): Promise<AxiosError | AxiosResponse> {
  let response = null;
  try {
    response = await requestFunction(createAxios());
  } catch (exc: any) {
    if (exc.name === 'AxiosError') {
      handleRequestError(exc);
      return exc;
    }
    throw exc;
  }
  return response;
}

function getTimeState() {
  // Used to force a refresh on SWRResponse, even when the response stays the same.
  // For example, when the page layout depends on time, but the response contains
  // timestamps that don't change, this is necessary.
  return { time: new Date() };
}

const fetcher = (url: string) =>
  createAxios()
    .get(url)
    .then((res: { data: any }) => res.data);

const fetcherWithTimestamp = (url: string) =>
  createAxios()
    .get(url)
    .then((res: { data: any }) => ({ ...res.data, ...getTimeState() }));

export function getClubs(): SWRResponse {
  return useSWR('clubs', fetcher);
}

export function getTournamentByEndpointName(tournament_endpoint_name: string): SWRResponse {
  return useSWR(`tournaments?endpoint_name=${tournament_endpoint_name}`, fetcher);
}

export function getTournamentById(tournament_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}`, fetcher);
}

export function getTournaments(): SWRResponse {
  return useSWR('tournaments', fetcher);
}

export function getPlayers(tournament_id: number, not_in_team: boolean = false): SWRResponse {
  return useSWR(
    `tournaments/${tournament_id}/players?not_in_team=${not_in_team}&limit=100`,
    fetcher
  );
}

export function getPlayersPaginated(tournament_id: number, pagination: Pagination): SWRResponse {
  return useSWR(
    `tournaments/${tournament_id}/players?limit=${pagination.limit}&offset=${pagination.offset}&sort_by=${pagination.sort_by}&sort_direction=${pagination.sort_direction}`,
    fetcher
  );
}

export function getTeams(tournament_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/teams?limit=100`, fetcher);
}

export function getTeamsPaginated(tournament_id: number, pagination: Pagination): SWRResponse {
  return useSWR(
    `tournaments/${tournament_id}/teams?limit=${pagination.limit}&offset=${pagination.offset}&sort_by=${pagination.sort_by}&sort_direction=${pagination.sort_direction}`,
    fetcher
  );
}

export function getTeamsLive(tournament_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/teams`, fetcher, {
    refreshInterval: 5_000,
  });
}

export function getAvailableStageItemInputs(tournament_id: number, stage_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/stages/${stage_id}/available_inputs`, fetcher);
}

export function getStages(tournament_id: number, no_draft_rounds: boolean = false): SWRResponse {
  return useSWR(
    tournament_id === -1
      ? null
      : `tournaments/${tournament_id}/stages?no_draft_rounds=${no_draft_rounds}`,
    fetcher
  );
}

export function getStagesLive(
  tournament_id: number,
  no_draft_rounds: boolean = false
): SWRResponse {
  return useSWR(
    tournament_id === -1
      ? null
      : `tournaments/${tournament_id}/stages?no_draft_rounds=${no_draft_rounds}`,
    fetcherWithTimestamp,
    {
      refreshInterval: 5_000,
    }
  );
}

export function getCourts(tournament_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/courts`, fetcher);
}

export function getCourtsLive(tournament_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/courts`, fetcher, {
    refreshInterval: 60_000,
  });
}

export function getUser(): SWRResponse {
  return useSWR('users/me', fetcher);
}

export function getUpcomingMatches(
  tournament_id: number,
  round_id: number,
  schedulerSettings: SchedulerSettings
): SWRResponse {
  return useSWR(
    round_id === -1
      ? null
      : `tournaments/${tournament_id}/rounds/${round_id}/upcoming_matches?elo_diff_threshold=${schedulerSettings.eloThreshold}&only_recommended=${schedulerSettings.onlyRecommended}&limit=${schedulerSettings.limit}&iterations=${schedulerSettings.iterations}`,
    fetcher
  );
}

export async function uploadTournamentLogo(tournament_id: number, file: any) {
  const bodyFormData = new FormData();
  bodyFormData.append('file', file, file.name);

  return createAxios().post(`tournaments/${tournament_id}/logo`, bodyFormData);
}

export async function removeTournamentLogo(tournament_id: number) {
  return createAxios().post(`tournaments/${tournament_id}/logo`);
}

export async function uploadTeamLogo(tournament_id: number, team_id: number, file: any) {
  const bodyFormData = new FormData();
  bodyFormData.append('file', file, file.name);

  return createAxios().post(`tournaments/${tournament_id}/teams/${team_id}/logo`, bodyFormData);
}

export async function removeTeamLogo(tournament_id: number, team_id: number) {
  return createAxios().post(`tournaments/${tournament_id}/teams/${team_id}/logo`);
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
      .get('users/me')
      .then(() => {})
      .catch((error: any) => {
        if (error.toJSON().status === 401) {
          performLogout();
        }
      });
  }
}
