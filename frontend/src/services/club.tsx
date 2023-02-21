import { createAxios, handleRequestError } from './adapter';

export async function createClub(name: string) {
  return createAxios()
    .post('tournaments/clubs', { name })
    .catch((response: any) => handleRequestError(response));
}

export async function deleteClub(club_id: number) {
  return createAxios()
    .delete(`tournaments/clubs/${club_id}`)
    .catch((response: any) => handleRequestError(response));
}

export async function updateClub(club_id: number, name: string) {
  return createAxios()
    .patch(`tournaments/clubs/${club_id}`, {
      name,
    })
    .catch((response: any) => handleRequestError(response));
}
