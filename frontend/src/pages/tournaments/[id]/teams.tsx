import { Title } from '@mantine/core';
import TeamsTable from '../../../components/tables/teams';
import { getStaticPaths as _getStaticPaths, getStaticProps as _getStaticProps } from '../[id]';
import TournamentLayout from '../_tournament_layout';
import TeamModal from '../../../components/modals/team_modal';

export default function Teams({ tournamentData }: any) {
  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Title>Teams</Title>
      <TeamModal tournament_id={tournamentData.id} team={null} />
      <TeamsTable tournament_id={tournamentData.id} />
    </TournamentLayout>
  );
}

export const getStaticPaths = _getStaticPaths;
export const getStaticProps = _getStaticProps;
