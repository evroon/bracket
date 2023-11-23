import { getTournamentEndpointFromRouter } from '../components/utils/util';
import { createAxios, getTournamentByEndpointName, handleRequestError } from './adapter';

export async function createTournament(
  club_id: number,
  name: string,
  dashboard_public: boolean,
  dashboard_endpoint: string,
  players_can_be_in_multiple_teams: boolean,
  auto_assign_courts: boolean,
  start_time: string,
  duration_minutes: number,
  margin_minutes: number
) {
  return createAxios()
    .post('tournaments', {
      name,
      club_id,
      dashboard_public,
      dashboard_endpoint,
      players_can_be_in_multiple_teams,
      auto_assign_courts,
      start_time,
      duration_minutes,
      margin_minutes,
    })
    .catch((response: any) => handleRequestError(response));
}

export async function deleteTournament(tournament_id: number) {
  return createAxios()
    .delete(`tournaments/${tournament_id}`)
    .catch((response: any) => handleRequestError(response));
}

export async function updateTournament(
  tournament_id: number,
  name: string,
  dashboard_public: boolean,
  dashboard_endpoint: string,
  players_can_be_in_multiple_teams: boolean,
  auto_assign_courts: boolean,
  start_time: string,
  duration_minutes: number,
  margin_minutes: number
) {
  return createAxios()
    .put(`tournaments/${tournament_id}`, {
      name,
      dashboard_public,
      dashboard_endpoint,
      players_can_be_in_multiple_teams,
      auto_assign_courts,
      start_time,
      duration_minutes,
      margin_minutes,
    })
    .catch((response: any) => handleRequestError(response));
}

export function getTournamentResponseByEndpointName() {
  const endpointName = getTournamentEndpointFromRouter();
  const swrTournamentsResponse = getTournamentByEndpointName(endpointName);

  return swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : null;
}
