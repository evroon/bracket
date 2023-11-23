import {
  Button,
  Checkbox,
  Grid,
  Group,
  Image,
  Modal,
  NumberInput,
  Select,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { IconCalendar, IconCalendarTime } from '@tabler/icons-react';
import assert from 'assert';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { Club } from '../../interfaces/club';
import { Tournament } from '../../interfaces/tournament';
import { getBaseApiUrl, getClubs } from '../../services/adapter';
import { createTournament } from '../../services/tournament';
import SaveButton from '../buttons/save';

export function TournamentLogo({ tournament }: { tournament: Tournament | null }) {
  if (tournament == null || tournament.logo_path == null) return null;
  return <Image radius="md" src={`${getBaseApiUrl()}/static/${tournament.logo_path}`} />;
}

function GeneralTournamentForm({
  setOpened,
  swrTournamentsResponse,
  clubs,
}: {
  setOpened: any;
  swrTournamentsResponse: SWRResponse;
  clubs: Club[];
}) {
  const form = useForm({
    initialValues: {
      start_time: new Date(),
      name: '',
      club_id: null,
      dashboard_public: true,
      dashboard_endpoint: '',
      players_can_be_in_multiple_teams: false,
      auto_assign_courts: true,
      duration_minutes: 10,
      margin_minutes: 5,
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
      club_id: (value) => (value != null ? null : 'Please choose a club'),
      start_time: (value) => (value != null ? null : 'Please choose a start time'),
      duration_minutes: (value) =>
        value != null && value > 0 ? null : 'Please choose a duration of the matches',
      margin_minutes: (value) =>
        value != null && value > 0 ? null : 'Please choose a margin of the matches',
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        assert(values.club_id != null);
        await createTournament(
          parseInt(values.club_id, 10),
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
        setOpened(false);
      })}
    >
      <TextInput
        withAsterisk
        label="Name"
        placeholder="Best Tournament Ever"
        {...form.getInputProps('name')}
      />

      <Select
        withAsterisk
        data={clubs.map((p) => ({ value: `${p.id}`, label: p.name }))}
        label="Club"
        placeholder="Pick a club for this tournament"
        searchable
        limit={20}
        style={{ marginTop: 10 }}
        {...form.getInputProps('club_id')}
      />

      <TextInput
        label="Dashboard link"
        placeholder="best_tournament"
        mt="lg"
        {...form.getInputProps('dashboard_endpoint')}
      />
      <Grid mt="1rem">
        <Grid.Col sm={9}>
          <DateTimePicker
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
            onClick={() => {
              form.setFieldValue('start_time', new Date());
            }}
          >
            NOW
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
        mt="md"
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

      <Button fullWidth mt={8} color="green" type="submit">
        Save
      </Button>
    </form>
  );
}

export default function TournamentModal({
  swrTournamentsResponse,
}: {
  swrTournamentsResponse: SWRResponse;
}) {
  const [opened, setOpened] = useState(false);
  const operation_text = 'Create Tournament';
  const swrClubsResponse: SWRResponse = getClubs();
  const clubs: Club[] = swrClubsResponse.data != null ? swrClubsResponse.data.data : [];

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={operation_text} size="50rem">
        <GeneralTournamentForm
          setOpened={setOpened}
          swrTournamentsResponse={swrTournamentsResponse}
          clubs={clubs}
        />
      </Modal>
      <Group position="right">
        <SaveButton
          onClick={() => setOpened(true)}
          leftIcon={<GoPlus size={24} />}
          title={operation_text}
        />
      </Group>
    </>
  );
}
