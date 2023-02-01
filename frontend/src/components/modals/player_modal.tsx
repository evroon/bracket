import { Button, Checkbox, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { createPlayer, updatePlayer } from '../../services/player';
import SaveButton from '../buttons/save';

export default function PlayerModal({
  tournament_id,
  player,
  swrPlayersResponse,
}: {
  tournament_id: number;
  player: Player | null;
  swrPlayersResponse: SWRResponse;
}) {
  const is_create_form = player == null;
  const operation_text = is_create_form ? 'Create Player' : 'Edit Player';
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
      name: player == null ? '' : player.name,
      active: player == null ? true : player.active,
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={operation_text}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            if (is_create_form) await createPlayer(tournament_id, values.name, values.active, null);
            else await updatePlayer(tournament_id, player.id, values.name, values.active, null);
            await swrPlayersResponse.mutate(null);
            // setOpened(false);
          })}
        >
          <TextInput
            withAsterisk
            label="Name"
            placeholder="Best Player Ever"
            {...form.getInputProps('name')}
          />

          <Checkbox
            mt="md"
            label="This player is active"
            {...form.getInputProps('active', { type: 'checkbox' })}
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
