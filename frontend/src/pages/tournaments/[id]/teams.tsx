import { Grid, Title } from '@mantine/core';
import { SWRResponse } from 'swr';

import TeamModal from '../../../components/modals/team_modal';
import TeamsTable from '../../../components/tables/teams';
import { getTournamentIdFromRouter } from '../../../components/utils/util';
import { getTeams } from '../../../services/adapter';
import TournamentLayout from '../_tournament_layout';

export default function Teams() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrTeamsResponse: SWRResponse = getTeams(tournamentData.id);
  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Grid grow>
        <Grid.Col span={9}>
          <Title>Teams</Title>
        </Grid.Col>
        <Grid.Col span={3}>
          <TeamModal
            swrTeamsResponse={swrTeamsResponse}
            tournament_id={tournamentData.id}
            team={null}
          />
        </Grid.Col>
      </Grid>
      <TeamsTable swrTeamsResponse={swrTeamsResponse} tournamentData={tournamentData} />
    </TournamentLayout>
  );
}
