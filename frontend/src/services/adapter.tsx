import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse } from 'swr';

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
  const user = localStorage.getItem('login');
  const access_token = user != null ? JSON.parse(user).access_token : '';
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

export function getRounds(tournament_id: number, no_draft_rounds: boolean = false): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/rounds?no_draft_rounds=${no_draft_rounds}`, fetcher);
}

export function getUpcomingMatches(tournament_id: number): SWRResponse {
  return useSWR(`tournaments/${tournament_id}/upcoming_matches`, fetcher);
}

export async function uploadLogo(tournament_id: number, file: any) {
  const bodyFormData = new FormData();
  bodyFormData.append('file', file, file.name);

  return createAxios().post(`tournaments/${tournament_id}/logo`, bodyFormData);
}
