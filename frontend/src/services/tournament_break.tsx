import { Dayjs } from 'dayjs';

import { createAxios, handleRequestError } from './adapter';

export async function createTournamentBreak(
  tournament_id: number,
  title: string,
  start_time: Dayjs | null,
  end_time: Dayjs | null
) {
  return createAxios()
    .post(`tournaments/${tournament_id}/breaks`, { title, start_time, end_time })
    .catch((response: any) => handleRequestError(response));
}

export async function updateTournamentBreak(
  tournament_id: number,
  break_id: number,
  title: string,
  start_time: Dayjs | null,
  end_time: Dayjs | null
) {
  return createAxios()
    .put(`tournaments/${tournament_id}/breaks/${break_id}`, { title, start_time, end_time })
    .catch((response: any) => handleRequestError(response));
}

export async function deleteTournamentBreak(tournament_id: number, break_id: number) {
  return createAxios()
    .delete(`tournaments/${tournament_id}/breaks/${break_id}`)
    .catch((response: any) => handleRequestError(response));
}
