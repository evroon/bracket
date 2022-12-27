import { Grid, Title } from '@mantine/core';
import { SWRResponse } from 'swr';

import TeamModal from '../../../components/modals/team_modal';
import TeamsTable from '../../../components/tables/teams';
import { Tournament } from '../../../interfaces/tournament';
import { getTeams } from '../../../services/adapter';
import { getStaticPaths as _getStaticPaths, getStaticProps as _getStaticProps } from '../[id]';
import TournamentLayout from '../_tournament_layout';

export default function Teams({ tournamentData }: { tournamentData: Tournament }) {
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

export const getStaticPaths = _getStaticPaths;
export const getStaticProps = _getStaticProps;
