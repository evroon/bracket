import { Grid, Title } from '@mantine/core';

import PlayerModal from '../../../components/modals/player_modal';
import PlayersTable from '../../../components/tables/players';
import { getTournamentIdFromRouter } from '../../../components/utils/util';
import { getPlayers } from '../../../services/adapter';
import TournamentLayout from '../_tournament_layout';

export default function Players() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrPlayersResponse = getPlayers(tournamentData.id);
  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Grid grow>
        <Grid.Col span={9}>
          <Title>Players</Title>
        </Grid.Col>
        <Grid.Col span={3}>
          <PlayerModal
            swrPlayersResponse={swrPlayersResponse}
            tournament_id={tournamentData.id}
            player={null}
          />
        </Grid.Col>
      </Grid>
      <PlayersTable swrPlayersResponse={swrPlayersResponse} tournamentData={tournamentData} />
    </TournamentLayout>
  );
}
