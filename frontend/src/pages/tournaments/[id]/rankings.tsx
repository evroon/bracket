import { Accordion, Badge, Button, Center, Checkbox, Container, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';
import { SWRResponse } from 'swr';

import DeleteButton from '../../../components/buttons/delete';
import { EmptyTableInfo } from '../../../components/no_content/empty_table_info';
import RequestErrorAlert from '../../../components/utils/error_alert';
import { TableSkeletonSingleColumn } from '../../../components/utils/skeletons';
import { Translator } from '../../../components/utils/types';
import { getTournamentIdFromRouter } from '../../../components/utils/util';
import { Ranking } from '../../../interfaces/ranking';
import { Tournament } from '../../../interfaces/tournament';
import { getRankings, getTournamentById } from '../../../services/adapter';
import { createRanking, deleteRanking, editRanking } from '../../../services/ranking';
import TournamentLayout from '../_tournament_layout';

function RankingDeleteButton({
  t,
  tournament,
  ranking,
  swrRankingsResponse,
}: {
  t: Translator;
  tournament: Tournament;
  ranking: Ranking;
  swrRankingsResponse: SWRResponse;
}) {
  if (ranking.position === 0) {
    return (
      <Center ml="1rem" miw="10rem">
        <Badge color="indigo">{t('default_ranking_badge')}</Badge>
      </Center>
    );
  }
  return (
    <DeleteButton
      onClick={async () => {
        await deleteRanking(tournament.id, ranking.id);
        await swrRankingsResponse.mutate();
      }}
      title={t('delete_ranking_button')}
      ml="1rem"
      variant="outline"
      miw="10rem"
    />
  );
}

function EditRankingForm({
  t,
  tournament,
  ranking,
  swrRankingsResponse,
}: {
  t: Translator;
  tournament: Tournament;
  ranking: Ranking;
  swrRankingsResponse: SWRResponse;
}) {
  const form = useForm({
    initialValues: {
      win_points: ranking.win_points,
      draw_points: ranking.draw_points,
      loss_points: ranking.loss_points,
      add_score_points: ranking.add_score_points,
      position: ranking.position,
    },
    validate: {},
  });
  const rankingTitle = `${t('ranking_title')} ${ranking.position + 1}`;

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        await editRanking(
          tournament.id,
          ranking.id,
          values.win_points,
          values.draw_points,
          values.loss_points,
          values.add_score_points,
          values.position
        );
        await swrRankingsResponse.mutate();
      })}
    >
      <Accordion.Item key={ranking.id} value={`${ranking.position}`}>
        <Center>
          <Accordion.Control>{rankingTitle}</Accordion.Control>
          <Center>
            <RankingDeleteButton
              t={t}
              tournament={tournament}
              ranking={ranking}
              swrRankingsResponse={swrRankingsResponse}
            />
          </Center>
        </Center>
        <Accordion.Panel>
          <NumberInput
            withAsterisk
            label={t('win_points_input_label')}
            {...form.getInputProps('win_points')}
          />
          <NumberInput
            mt="1rem"
            withAsterisk
            label={t('draw_points_input_label')}
            {...form.getInputProps('draw_points')}
          />
          <NumberInput
            mt="1rem"
            withAsterisk
            label={t('loss_points_input_label')}
            {...form.getInputProps('loss_points')}
          />
          <Checkbox
            mt="lg"
            label={t('add_score_points_label')}
            {...form.getInputProps('add_score_points', { type: 'checkbox' })}
          />
          <Button fullWidth style={{ marginTop: 16 }} color="green" type="submit">
            {`${t('save_button')} ${rankingTitle}`}
          </Button>
        </Accordion.Panel>
      </Accordion.Item>
    </form>
  );
}

function RankingForm({
  t,
  tournament,
  swrRankingsResponse,
}: {
  t: Translator;
  tournament: Tournament;
  swrRankingsResponse: SWRResponse;
}) {
  const rankings: Ranking[] = swrRankingsResponse.data != null ? swrRankingsResponse.data.data : [];

  const rows = rankings
    .sort((s1: Ranking, s2: Ranking) => s1.position - s2.position)
    .map((ranking) => (
      <EditRankingForm
        t={t}
        tournament={tournament}
        ranking={ranking}
        swrRankingsResponse={swrRankingsResponse}
      />
    ));

  if (swrRankingsResponse.isLoading) {
    return <TableSkeletonSingleColumn />;
  }

  if (swrRankingsResponse.error) return <RequestErrorAlert error={swrRankingsResponse.error} />;

  if (rows.length < 1) return <EmptyTableInfo entity_name={t('rankings_title')} />;

  return (
    <Accordion multiple defaultValue={['0']}>
      {rows}
    </Accordion>
  );
}

export default function RankingsPage() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrRankingsResponse = getRankings(tournamentData.id);

  const swrTournamentResponse = getTournamentById(tournamentData.id);
  const tournamentDataFull =
    swrTournamentResponse.data != null ? swrTournamentResponse.data.data : null;
  const { t } = useTranslation();

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Container maw="50rem">
        <RankingForm
          t={t}
          tournament={tournamentDataFull}
          swrRankingsResponse={swrRankingsResponse}
        />
        <Button
          fullWidth
          mt="1rem"
          color="green"
          variant="outline"
          onClick={async () => {
            await createRanking(tournamentDataFull.id);
            await swrRankingsResponse.mutate();
          }}
        >
          {t('add_ranking_button')}
        </Button>
      </Container>
    </TournamentLayout>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
