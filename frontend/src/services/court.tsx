import { createAxios, handleRequestError } from './adapter';

export async function createCourt(tournament_id: number, name: string) {
  return createAxios()
    .post(`tournaments/${tournament_id}/courts`, { name })
    .catch((response: any) => handleRequestError(response));
}

export async function deleteCourt(tournament_id: number, court_id: number) {
  return createAxios()
    .delete(`tournaments/${tournament_id}/courts/${court_id}`)
    .catch((response: any) => handleRequestError(response));
}
