import {
  Button,
  Center,
  Checkbox,
  Container,
  CopyButton,
  Fieldset,
  Grid,
  Image,
  NumberInput,
  Select,
  Text,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCalendar, IconCalendarTime } from '@tabler/icons-react';
import assert from 'assert';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../404';
import { DropzoneButton } from '../../../components/utils/file_upload';
import { GenericSkeleton } from '../../../components/utils/skeletons';
import { capitalize, getBaseURL, getTournamentIdFromRouter } from '../../../components/utils/util';
import { Club } from '../../../interfaces/club';
import { Tournament, getTournamentEndpoint } from '../../../interfaces/tournament';
import {
  getBaseApiUrl,
  getClubs,
  getTournamentById,
  removeTournamentLogo,
} from '../../../services/adapter';
import { updateTournament } from '../../../services/tournament';
import TournamentLayout from '../_tournament_layout';

export function TournamentLogo({ tournament }: { tournament: Tournament | null }) {
  if (tournament == null || tournament.logo_path == null) return null;
  return (
    <Image radius="md" src={`${getBaseApiUrl()}/static/tournament-logos/${tournament.logo_path}`} />
  );
}

function GeneralTournamentForm({
  tournament,
  swrTournamentResponse,
  clubs,
}: {
  tournament: Tournament;
  swrTournamentResponse: SWRResponse;
  clubs: Club[];
}) {
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      start_time: new Date(tournament.start_time),
      name: tournament.name,
      club_id: `${tournament.club_id}`,
      dashboard_public: tournament.dashboard_public,
      dashboard_endpoint: tournament.dashboard_endpoint,
      players_can_be_in_multiple_teams: tournament.players_can_be_in_multiple_teams,
      auto_assign_courts: tournament.auto_assign_courts,
      duration_minutes: tournament.duration_minutes,
      margin_minutes: tournament.margin_minutes,
    },

    validate: {
      name: (value) => (value.length > 0 ? null : t('too_short_name_validation')),
      club_id: (value) => (value != null ? null : t('club_choose_title')),
      start_time: (value) => (value != null ? null : t('start_time_choose_title')),
      duration_minutes: (value) =>
        value != null && value > 0 ? null : t('duration_minutes_choose_title'),
      margin_minutes: (value) =>
        value != null && value > 0 ? null : t('margin_minutes_choose_title'),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        assert(values.club_id != null);

        await updateTournament(
          tournament.id,
          values.name,
          values.dashboard_public,
          values.dashboard_endpoint,
          values.players_can_be_in_multiple_teams,
          values.auto_assign_courts,
          values.start_time.toISOString(),
          values.duration_minutes,
          values.margin_minutes
        );

        await swrTournamentResponse.mutate();
      })}
    >
      <TextInput
        withAsterisk
        label={t('name_input_label')}
        placeholder={t('tournament_name_input_placeholder')}
        {...form.getInputProps('name')}
      />

      <Select
        withAsterisk
        data={clubs.map((p) => ({ value: `${p.id}`, label: p.name }))}
        label={capitalize(t('clubs_title'))}
        placeholder={t('club_select_placeholder')}
        searchable
        limit={20}
        mt="lg"
        {...form.getInputProps('club_id')}
      />

      <Fieldset legend={t('planning_of_matches_legend')} mt="lg" radius="md">
        <Text fz="sm">{t('planning_of_matches_description')}</Text>
        <Grid>
          <Grid.Col span={{ sm: 9 }}>
            <DateTimePicker
              rightSection={<IconCalendar size="1.1rem" stroke={1.5} />}
              mx="auto"
              {...form.getInputProps('start_time')}
            />
          </Grid.Col>
          <Grid.Col span={{ sm: 3 }}>
            <Button
              fullWidth
              color="indigo"
              leftSection={<IconCalendarTime size="1.1rem" stroke={1.5} />}
              onClick={() => {
                form.setFieldValue('start_time', new Date());
              }}
            >
              {t('set_to_new_button')}
            </Button>
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ sm: 6 }}>
            <NumberInput
              label={t('match_duration_label')}
              mt="lg"
              {...form.getInputProps('duration_minutes')}
            />
          </Grid.Col>
          <Grid.Col span={{ sm: 6 }}>
            <NumberInput
              label={t('time_between_matches_label')}
              mt="lg"
              {...form.getInputProps('margin_minutes')}
            />
          </Grid.Col>
        </Grid>
      </Fieldset>
      <Fieldset legend={t('dashboard_settings_title')} mt="lg" radius="md">
        <TextInput
          label={t('dashboard_link_label')}
          placeholder={t('dashboard_link_placeholder')}
          {...form.getInputProps('dashboard_endpoint')}
        />

        <Checkbox
          mt="lg"
          label={t('dashboard_public_description')}
          {...form.getInputProps('dashboard_public', { type: 'checkbox' })}
        />

        <DropzoneButton
          tournamentId={tournament.id}
          swrResponse={swrTournamentResponse}
          variant="tournament"
        />
        <Center my="lg">
          <div style={{ width: '50%' }}>
            <TournamentLogo tournament={tournament} />
          </div>
        </Center>
        <Button
          variant="outline"
          color="red"
          fullWidth
          onClick={async () => {
            await removeTournamentLogo(tournament.id);
            await swrTournamentResponse.mutate();
          }}
        >
          {t('remove_logo')}
        </Button>
      </Fieldset>
      <Fieldset legend={t('miscellaneous_title')} mt="lg" radius="md">
        <Checkbox
          label={t('miscellaneous_label')}
          {...form.getInputProps('players_can_be_in_multiple_teams', { type: 'checkbox' })}
        />
        <Checkbox
          mt="md"
          label={t('auto_assign_courts_label')}
          {...form.getInputProps('auto_assign_courts', { type: 'checkbox' })}
        />
      </Fieldset>

      <Button fullWidth mt={24} color="green" type="submit">
        {t('save_button')}
      </Button>

      {tournament != null ? (
        <CopyButton
          value={`${getBaseURL()}/tournaments/${getTournamentEndpoint(tournament)}/dashboard`}
        >
          {({ copied, copy }) => (
            <Button fullWidth mt={8} color={copied ? 'teal' : 'blue'} onClick={copy}>
              {copied ? t('copied_dashboard_url_button') : t('copy_dashboard_url_button')}
            </Button>
          )}
        </CopyButton>
      ) : null}
    </form>
  );
}

export default function SettingsPage() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrClubsResponse: SWRResponse = getClubs();
  const swrTournamentResponse = getTournamentById(tournamentData.id);
  const tournamentDataFull =
    swrTournamentResponse.data != null ? swrTournamentResponse.data.data : null;

  const clubs: Club[] = swrClubsResponse.data != null ? swrClubsResponse.data.data : [];

  let content = <NotFoundTitle />;

  if (swrTournamentResponse.isLoading || swrClubsResponse.isLoading) {
    content = <GenericSkeleton />;
  }

  if (tournamentDataFull != null) {
    content = (
      <GeneralTournamentForm
        tournament={tournamentDataFull}
        swrTournamentResponse={swrTournamentResponse}
        clubs={clubs}
      />
    );
  }

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Container>{content}</Container>
    </TournamentLayout>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
