import { Button, Checkbox, Modal, MultiSelect, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { TeamInterface } from '../../interfaces/team';
import { getPlayers } from '../../services/adapter';
import { updateTeam } from '../../services/team';

export default function TeamUpdateModal({
  tournament_id,
  team,
  swrTeamsResponse,
}: {
  tournament_id: number;
  team: TeamInterface;
  swrTeamsResponse: SWRResponse;
}) {
  const { data } = getPlayers(tournament_id, false);
  const players: Player[] = data != null ? data.data : [];
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: team.name,
      active: team.active,
      player_ids: team.players.map((player) => `${player.id}`),
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Edit Team">
        <form
          onSubmit={form.onSubmit(async (values) => {
            await updateTeam(tournament_id, team.id, values.name, values.active, values.player_ids);

            await swrTeamsResponse.mutate(null);
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

      <Button
        color="green"
        size="xs"
        style={{ marginRight: 10 }}
        onClick={() => setOpened(true)}
        leftIcon={<BiEditAlt size={20} />}
      >
        Edit Team
      </Button>
    </>
  );
}
