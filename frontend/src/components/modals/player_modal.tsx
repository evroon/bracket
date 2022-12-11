import { useState } from 'react';
import { Button, Group, Modal, TextInput } from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { createPlayer, updatePlayer } from '../../services/player';
import SaveButton from '../buttons/save';
import { Player } from '../../interfaces/player';

export default function PlayerModal({
  tournament_id,
  player,
}: {
  tournament_id: number;
  player: Player | null;
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
    <Button color="green" size="xs" onClick={() => setOpened(true)} leftIcon={icon}>
      {operation_text}
    </Button>
  );

  const form = useForm({
    initialValues: {
      name: player == null ? '' : player.name,
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={operation_text}>
        <form
          onSubmit={form.onSubmit((values) => {
            if (is_create_form) createPlayer(tournament_id, values.name, null);
            else updatePlayer(tournament_id, player.id, values.name, null);
            setOpened(false);
          })}
        >
          <TextInput
            withAsterisk
            label="Name"
            placeholder="Best Player Ever"
            {...form.getInputProps('name')}
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
