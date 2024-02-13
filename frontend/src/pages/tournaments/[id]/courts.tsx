import { Button, Container, Divider, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';
import { SWRResponse } from 'swr';

import CourtsTable from '../../../components/tables/courts';
import { Translator } from '../../../components/utils/types';
import { getTournamentIdFromRouter } from '../../../components/utils/util';
import { Tournament } from '../../../interfaces/tournament';
import { getCourts, getTournamentById } from '../../../services/adapter';
import { createCourt } from '../../../services/court';
import TournamentLayout from '../_tournament_layout';

function CreateCourtForm(t: Translator, tournament: Tournament, swrCourtsResponse: SWRResponse) {
  const form = useForm({
    initialValues: { name: '' },
    validate: {
      name: (value) => (value.length > 0 ? null : t('too_short_name_validation')),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        await createCourt(tournament.id, values.name);
        await swrCourtsResponse.mutate(null);
      })}
    >
      <Divider mt={12} />
      <h3>{t('add_court_title')}</h3>
      <TextInput
        withAsterisk
        label={t('name_input_label')}
        placeholder={t('court_name_input_placeholder')}
        {...form.getInputProps('name')}
      />
      <Button fullWidth style={{ marginTop: 16 }} color="green" type="submit">
        {t('create_court_button')}
      </Button>
    </form>
  );
}

export default function CourtsPage() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrCourtsResponse = getCourts(tournamentData.id);

  const swrTournamentResponse = getTournamentById(tournamentData.id);
  const tournamentDataFull =
    swrTournamentResponse.data != null ? swrTournamentResponse.data.data : null;
  const { t } = useTranslation();

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Container>
        <CourtsTable t={t} tournament={tournamentDataFull} swrCourtsResponse={swrCourtsResponse} />
        {CreateCourtForm(t, tournamentDataFull, swrCourtsResponse)}
      </Container>
    </TournamentLayout>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
