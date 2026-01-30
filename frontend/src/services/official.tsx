import { createAxios, handleRequestError } from './adapter';

export async function createOfficial(tournament_id: number, name: string) {
  return createAxios()
    .post(`tournaments/${tournament_id}/officials`, { name })
    .catch((response: any) => handleRequestError(response));
}

export async function deleteOfficial(tournament_id: number, official_id: number) {
  return createAxios()
    .delete(`tournaments/${tournament_id}/officials/${official_id}`)
    .catch((response: any) => handleRequestError(response));
}

export async function autoAssignOfficials(tournament_id: number) {
  return createAxios()
    .post(`tournaments/${tournament_id}/officials/auto_assign`)
    .catch((response: any) => handleRequestError(response));
}

export async function clearOfficialAssignments(tournament_id: number) {
  return createAxios()
    .post(`tournaments/${tournament_id}/officials/clear_assignments`)
    .catch((response: any) => handleRequestError(response));
}
