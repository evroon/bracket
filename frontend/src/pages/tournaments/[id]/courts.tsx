import { Button, Container, Fieldset, Grid, TextInput } from '@mantine/core';
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
        await swrCourtsResponse.mutate();
      })}
    >
      <Fieldset legend={t('add_court_title')} radius="md">
        <TextInput
          withAsterisk
          label={t('name_input_label')}
          placeholder={t('court_name_input_placeholder')}
          {...form.getInputProps('name')}
        />
        <Button fullWidth style={{ marginTop: 16 }} color="green" type="submit">
          {t('create_court_button')}
        </Button>
      </Fieldset>
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
      <Container maw="100rem">
        <Grid grow>
          <Grid.Col span={{ lg: 8 }}>
            <CourtsTable
              t={t}
              tournament={tournamentDataFull}
              swrCourtsResponse={swrCourtsResponse}
            />
          </Grid.Col>
          <Grid.Col span={{ lg: 4 }}>
            {CreateCourtForm(t, tournamentDataFull, swrCourtsResponse)}
          </Grid.Col>
        </Grid>
      </Container>
    </TournamentLayout>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
