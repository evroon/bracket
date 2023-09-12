import {
  Button,
  Checkbox,
  CopyButton,
  Group,
  Image,
  Modal,
  Select,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import assert from 'assert';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { Club } from '../../interfaces/club';
import { Tournament } from '../../interfaces/tournament';
import { getBaseApiUrl, getClubs } from '../../services/adapter';
import { createTournament, updateTournament } from '../../services/tournament';
import SaveButton from '../buttons/save';
import { DropzoneButton } from '../utils/file_upload';
import { getBaseURL } from '../utils/util';

export function TournamentLogo({ tournament }: { tournament: Tournament | null }) {
  if (tournament == null || tournament.logo_path == null) return null;
  return <Image radius="md" src={`${getBaseApiUrl()}/static/${tournament.logo_path}`} />;
}

function GeneralTournamentForm({
  setOpened,
  is_create_form,
  tournament,
  swrTournamentsResponse,
  clubs,
}: {
  setOpened: any;
  is_create_form: boolean;
  tournament: Tournament | null;
  swrTournamentsResponse: SWRResponse;
  clubs: Club[];
}) {
  const form = useForm({
    initialValues: {
      name: tournament == null ? '' : tournament.name,
      club_id: tournament == null ? null : `${tournament.club_id}`,
      dashboard_public: tournament == null ? true : tournament.dashboard_public,
      players_can_be_in_multiple_teams:
        tournament == null ? true : tournament.players_can_be_in_multiple_teams,
      auto_assign_courts: tournament == null ? true : tournament.auto_assign_courts,
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
      club_id: (value) => (value != null ? null : 'Please choose a club'),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        assert(values.club_id != null);
        if (is_create_form) {
          await createTournament(
            parseInt(values.club_id, 10),
            values.name,
            values.dashboard_public,
            values.players_can_be_in_multiple_teams,
            values.auto_assign_courts
          );
        } else {
          assert(tournament != null);
          await updateTournament(
            tournament.id,
            values.name,
            values.dashboard_public,
            values.players_can_be_in_multiple_teams,
            values.auto_assign_courts
          );
        }
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
        data={clubs.map((p) => ({ value: `${p.id}`, label: p.name }))}
        label="Club"
        placeholder="Pick a club for this tournament"
        searchable
        limit={20}
        style={{ marginTop: 10 }}
        {...form.getInputProps('club_id')}
      />
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

      {tournament != null ? <DropzoneButton tournament={tournament} /> : null}

      <TournamentLogo tournament={tournament} />
      <Button fullWidth mt={8} color="green" type="submit">
        Save
      </Button>

      {tournament != null ? (
        <CopyButton value={`${getBaseURL()}/tournaments/${tournament.id}/dashboard`}>
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

export default function TournamentModal({
  tournament,
  swrTournamentsResponse,
  in_table,
}: {
  tournament: Tournament | null;
  swrTournamentsResponse: SWRResponse;
  in_table: boolean;
}) {
  const is_create_form = tournament == null;
  const operation_text = is_create_form ? 'Create Tournament' : 'Edit Tournament';
  const icon = is_create_form ? <GoPlus size={20} /> : <BiEditAlt size={20} />;
  const [opened, setOpened] = useState(false);
  const modalOpenButton = is_create_form ? (
    <Group position="right">
      <SaveButton
        onClick={() => setOpened(true)}
        leftIcon={<GoPlus size={24} />}
        title={operation_text}
      />
    </Group>
  ) : (
    <Button
      color="green"
      size={in_table ? 'xs' : 'md'}
      style={in_table ? { marginRight: 10 } : { marginBottom: 10 }}
      onClick={() => setOpened(true)}
      leftIcon={icon}
    >
      {operation_text}
    </Button>
  );
  const swrClubsResponse: SWRResponse = getClubs();
  const clubs: Club[] = swrClubsResponse.data != null ? swrClubsResponse.data.data : [];

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={operation_text}>
        <GeneralTournamentForm
          setOpened={setOpened}
          is_create_form={is_create_form}
          tournament={tournament}
          swrTournamentsResponse={swrTournamentsResponse}
          clubs={clubs}
        />
      </Modal>
      {modalOpenButton}
    </>
  );
}
