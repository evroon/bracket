import useSWR, { SWRResponse } from 'swr';

const axios = require('axios').default;

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

export function getPlayers(tournament_id: number): SWRResponse<any, any> {
  return useSWR(`tournaments/${tournament_id}/players`, fetcher);
}
