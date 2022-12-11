import { Title } from '@mantine/core';
import PlayersTable from '../../../components/tables/players';
import { getStaticPaths as _getStaticPaths, getStaticProps as _getStaticProps } from '../[id]';
import TournamentLayout from '../_tournament_layout';

export default function Teams({ tournamentData }: any) {
  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Title>Teams</Title>
      <PlayersTable tournament_id={tournamentData.id} />
    </TournamentLayout>
  );
}

export const getStaticPaths = _getStaticPaths;
export const getStaticProps = _getStaticProps;
