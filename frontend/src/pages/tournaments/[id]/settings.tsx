import {
  Button,
  Center,
  Checkbox,
  Container,
  CopyButton,
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
import React from 'react';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../404';
import { DropzoneButton } from '../../../components/utils/file_upload';
import { GenericSkeleton } from '../../../components/utils/skeletons';
import { getBaseURL, getTournamentIdFromRouter } from '../../../components/utils/util';
import { Club } from '../../../interfaces/club';
import { Tournament, getTournamentEndpoint } from '../../../interfaces/tournament';
import { getBaseApiUrl, getClubs, getTournaments } from '../../../services/adapter';
import { updateTournament } from '../../../services/tournament';
import TournamentLayout from '../_tournament_layout';

export function TournamentLogo({ tournament }: { tournament: Tournament | null }) {
  if (tournament == null || tournament.logo_path == null) return null;
  return <Image radius="md" src={`${getBaseApiUrl()}/static/${tournament.logo_path}`} />;
}

function GeneralTournamentForm({
  tournament,
  swrTournamentsResponse,
  clubs,
}: {
  tournament: Tournament;
  swrTournamentsResponse: SWRResponse;
  clubs: Club[];
}) {
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
      name: (value) => (value.length > 0 ? null : 'Name too short'),
      dashboard_endpoint: (value) => (value.length > 0 ? null : 'Dashboard link too short'),
      club_id: (value) => (value != null ? null : 'Please choose a club'),
      start_time: (value) => (value != null ? null : 'Please choose a start time'),
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

        await swrTournamentsResponse.mutate(null);
      })}
    >
      <TextInput
        withAsterisk
        label="Name"
        placeholder="Best Tournament Ever"
        {...form.getInputProps('name')}
      />

      <Select
        data={clubs.map((p) => ({ value: `${p.id}`, label: p.name }))}
        label="Club"
        placeholder="Pick a club for this tournament"
        searchable
        limit={20}
        mt="lg"
        {...form.getInputProps('club_id')}
      />

      <TextInput
        label="Dashboard link"
        placeholder="best_tournament"
        mt="lg"
        {...form.getInputProps('dashboard_endpoint')}
      />

      <Text fz="sm" mt="lg">
        Start of the tournament
      </Text>
      <Grid>
        <Grid.Col sm={9}>
          <DateTimePicker
            label=""
            icon={<IconCalendar size="1.1rem" stroke={1.5} />}
            placeholder="Pick date and time"
            mx="auto"
            {...form.getInputProps('start_time')}
          />
        </Grid.Col>
        <Grid.Col sm={3}>
          <Button
            fullWidth
            color="indigo"
            leftIcon={<IconCalendarTime size="1.1rem" stroke={1.5} />}
            type="submit"
            onClick={() => {
              form.setFieldValue('start_time', new Date());
            }}
          >
            Set to now
          </Button>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col sm={6}>
          <NumberInput
            label="Match duration (minutes)"
            mt="lg"
            type="number"
            {...form.getInputProps('duration_minutes')}
          />
        </Grid.Col>
        <Grid.Col sm={6}>
          <NumberInput
            label="Time between matches (minutes)"
            mt="lg"
            type="number"
            {...form.getInputProps('margin_minutes')}
          />
        </Grid.Col>
      </Grid>

      <Checkbox
        mt="lg"
        label="Allow anyone to see the dashboard of rounds and matches"
        {...form.getInputProps('dashboard_public', { type: 'checkbox' })}
      />
      <Checkbox
        mt="md"
        label="Allow players to be in multiple teams"
        {...form.getInputProps('players_can_be_in_multiple_teams', { type: 'checkbox' })}
      />
      <Checkbox
        mt="md"
        label="Automatically assign courts to matches"
        {...form.getInputProps('auto_assign_courts', { type: 'checkbox' })}
      />

      {tournament != null ? <DropzoneButton tournament={tournament} /> : null}

      <Center maw="50%" mx="auto">
        <TournamentLogo tournament={tournament} />
      </Center>

      <Button fullWidth mt={24} color="green" type="submit">
        Save
      </Button>

      {tournament != null ? (
        <CopyButton
          value={`${getBaseURL()}/tournaments/${getTournamentEndpoint(tournament)}/dashboard`}
        >
          {({ copied, copy }) => (
            <Button fullWidth mt={8} color={copied ? 'teal' : 'blue'} onClick={copy}>
              {copied ? 'Copied dashboard URL' : 'Copy dashboard URL'}
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
  const swrTournamentsResponse = getTournaments();

  const tournaments: Tournament[] =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : [];
  const tournamentDataFull = tournaments.filter(
    (tournament) => tournament.id === tournamentData.id
  )[0];

  const clubs: Club[] = swrClubsResponse.data != null ? swrClubsResponse.data.data : [];

  let content = <NotFoundTitle />;

  if (swrTournamentsResponse.isLoading || swrClubsResponse.isLoading) {
    content = <GenericSkeleton />;
  }

  if (tournamentDataFull != null) {
    content = (
      <GeneralTournamentForm
        tournament={tournamentDataFull}
        swrTournamentsResponse={swrTournamentsResponse}
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
