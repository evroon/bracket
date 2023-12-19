import { Button, Container, Divider, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SWRResponse } from 'swr';

import CourtsTable from '../../../components/tables/courts';
import { getTournamentIdFromRouter } from '../../../components/utils/util';
import { Tournament } from '../../../interfaces/tournament';
import { getCourts, getTournaments } from '../../../services/adapter';
import { createCourt } from '../../../services/court';
import TournamentLayout from '../_tournament_layout';

function CreateCourtForm(tournament: Tournament, swrCourtsResponse: SWRResponse) {
  const { t } = useTranslation();
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

  const swrTournamentsResponse = getTournaments();
  const tournaments: Tournament[] =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : [];
  const tournamentDataFull = tournaments.filter(
    (tournament) => tournament.id === tournamentData.id
  )[0];

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Container>
        <CourtsTable tournament={tournamentDataFull} swrCourtsResponse={swrCourtsResponse} />
        {CreateCourtForm(tournamentDataFull, swrCourtsResponse)}
      </Container>
    </TournamentLayout>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
