import { Title } from '@mantine/core';
import PlayersTable from '../../../components/tables/players';
import { getStaticPaths as _getStaticPaths, getStaticProps as _getStaticProps } from '../[id]';
import TournamentLayout from '../_tournament_layout';
import PlayerModal from '../../../components/modals/player_modal';

export default function Players({ tournamentData }: any) {
  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Title>Players</Title>
      <PlayerModal tournament_id={tournamentData.id} player={null} />
      <PlayersTable tournament_id={tournamentData.id} />
    </TournamentLayout>
  );
}

export const getStaticPaths = _getStaticPaths;
export const getStaticProps = _getStaticProps;
