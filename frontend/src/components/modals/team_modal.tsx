import { Button, Checkbox, Group, Modal, MultiSelect, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { TeamInterface } from '../../interfaces/team';
import { getPlayers } from '../../services/adapter';
import { createTeam, updateTeam } from '../../services/team';
import SaveButton from '../buttons/save';

export default function TeamModal({
  tournament_id,
  team,
  swrTeamsResponse,
}: {
  tournament_id: number;
  team: TeamInterface | null;
  swrTeamsResponse: SWRResponse;
}) {
  const { data } = getPlayers(tournament_id, false);
  const players: Player[] = data != null ? data.data : [];

  const is_create_form = team == null;
  const operation_text = is_create_form ? 'Create Team' : 'Edit Team';
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
      size="xs"
      style={{ marginRight: 10 }}
      onClick={() => setOpened(true)}
      leftIcon={icon}
    >
      {operation_text}
    </Button>
  );

  const form = useForm({
    initialValues: {
      name: team == null ? '' : team.name,
      active: team == null ? true : team.active,
      player_ids: team == null ? [] : team.players.map((player) => `${player.id}`),
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={operation_text} >
        <form
          onSubmit={form.onSubmit(async (values) => {
            if (is_create_form) {
              await createTeam(tournament_id, values.name, values.active, values.player_ids);
            } else {
              await updateTeam(
                tournament_id,
                team.id,
                values.name,
                values.active,
                values.player_ids
              );
            }
            swrTeamsResponse.mutate(null);
            setOpened(false);
          })}
        >
          <TextInput
            withAsterisk
            label="Name"
            placeholder="Best Team Ever"
            {...form.getInputProps('name')}
          />

          <Checkbox
            mt="md"
            label="This team is active"
            {...form.getInputProps('active', { type: 'checkbox' })}
          />

          <MultiSelect
            data={players.map((p) => ({ value: `${p.id}`, label: p.name }))}
            label="Team members"
            placeholder="Pick all that you like"
            dropdownPosition="bottom"
            maxDropdownHeight={160}
            searchable
            mb="12rem"
            mt={12}
            limit={25}
            {...form.getInputProps('player_ids')}
          />

          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            Save
          </Button>
        </form>
      </Modal>

      {modalOpenButton}
    </>
  );
}
