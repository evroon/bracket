import { Button, Checkbox, Group, Image, Modal, Select, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import assert from 'assert';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { ClubInterface } from '../../interfaces/club';
import { Tournament } from '../../interfaces/tournament';
import { getBaseApiUrl, getClubs } from '../../services/adapter';
import { createTournament, updateTournament } from '../../services/tournament';
import SaveButton from '../buttons/save';
import { DropzoneButton } from '../utils/file_upload';

export function TournamentLogo({ tournament }: { tournament: Tournament | null }) {
  if (tournament == null) return null;
  return <Image radius="md" src={`${getBaseApiUrl()}/static/${tournament.logo_path}`} />;
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
  const clubs: ClubInterface[] = swrClubsResponse.data != null ? swrClubsResponse.data.data : [];

  const form = useForm({
    initialValues: {
      name: tournament == null ? '' : tournament.name,
      club_id: tournament == null ? null : tournament.club_id,
      dashboard_public: tournament == null ? true : tournament.dashboard_public,
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
      club_id: (value) => (value != null ? null : 'Please choose a club'),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={operation_text}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            assert(values.club_id != null);
            if (is_create_form)
              await createTournament(values.club_id, values.name, values.dashboard_public);
            else {
              await updateTournament(tournament.id, values.name, values.dashboard_public);
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

          {tournament != null ? <DropzoneButton tournament={tournament} /> : null}

          <TournamentLogo tournament={tournament} />
          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            Save
          </Button>
        </form>
      </Modal>

      {modalOpenButton}
    </>
  );
}
