import {Grid, Title} from '@mantine/core';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';

import PlayerCreateModal from '../../../components/modals/player_create_modal';
import PlayersTable from '../../../components/tables/players';
import {capitalize, getTournamentIdFromRouter} from '../../../components/utils/util';
import {getPlayersPaginated} from '../../../services/adapter';
import TournamentLayout from '../_tournament_layout';
import React, {useState} from "react";
import {Center, Pagination} from "@mantine/core";

export default function Players() {
  const pageSize = 25;
  const [page, setPage] = useState(1);
  const { tournamentData } = getTournamentIdFromRouter();
  const swrPlayersResponse = getPlayersPaginated(tournamentData.id, {
    limit: pageSize,
    offset: pageSize * (page - 1),
  });
  const playerCount = swrPlayersResponse.data != null ? swrPlayersResponse.data.data.count : 1;
  const { t } = useTranslation();
  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Grid justify="space-between">
        <Grid.Col span="auto">
          <Title>{capitalize(t('players_title'))}</Title>
        </Grid.Col>
        <Grid.Col span="content">
          <PlayerCreateModal
            swrPlayersResponse={swrPlayersResponse}
            tournament_id={tournamentData.id}
          />
        </Grid.Col>
      </Grid>
      <PlayersTable swrPlayersResponse={swrPlayersResponse} tournamentData={tournamentData} />
      <Center mt="1rem">
        <Pagination value={page} onChange={setPage} total={1 + playerCount / pageSize} size="lg" />
      </Center>
    </TournamentLayout>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
