import { Button, Checkbox, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { updatePlayer } from '../../services/player';

export default function PlayerUpdateModal({
  tournament_id,
  player,
  swrPlayersResponse,
}: {
  tournament_id: number;
  player: Player;
  swrPlayersResponse: SWRResponse;
}) {
  const [opened, setOpened] = useState(false);
  const modalOpenButton = (
    <Button
      color="green"
      size="xs"
      style={{ marginRight: 10 }}
      onClick={() => setOpened(true)}
      leftSection={<BiEditAlt size={20} />}
    >
      Edit Player
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
      <Modal opened={opened} onClose={() => setOpened(false)} title="Edit Player">
        <form
          onSubmit={form.onSubmit(async (values) => {
            await updatePlayer(tournament_id, player.id, values.name, values.active, null);
            await swrPlayersResponse.mutate(null);
            setOpened(false);
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
