import { showNotification } from '@mantine/notifications';
import useSWR, { SWRResponse } from 'swr';

const axios = require('axios').default;

export function handleRequestError(error: any) {
  showNotification({
    color: 'red',
    title: 'Default notification',
    message: error.response.data.detail.toString(),
  });
}

export function createAxios() {
  const user = localStorage.getItem('login');
  const access_token = user != null ? JSON.parse(user).access_token : '';
  return axios.create({
    baseURL: 'http://localhost:8400',
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

export function getTournaments(): SWRResponse<any, any> {
  return useSWR('tournaments', fetcher);
}

export function getPlayers(
  tournament_id: number,
  not_in_team: boolean = false
): SWRResponse<any, any> {
  return useSWR(`tournaments/${tournament_id}/players?not_in_team=${not_in_team}`, fetcher);
}

export function getSinglePlayer(tournament_id: number, player_id: number): SWRResponse<any, any> {
  return useSWR(`tournaments/${tournament_id}/players/${player_id}`, fetcher);
}

export function getTeams(tournament_id: number): SWRResponse<any, any> {
  return useSWR(`tournaments/${tournament_id}/teams`, fetcher);
}
