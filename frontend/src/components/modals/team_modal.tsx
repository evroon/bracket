import { useState } from 'react';
import { Button, Checkbox, Group, Modal, TextInput } from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { useForm } from '@mantine/form';
import { createTeam, updateTeam } from '../../services/team';
import SaveButton from '../buttons/save';
import { Team } from '../../interfaces/team';

export default function TeamModal({
  tournament_id,
  team,
}: {
  tournament_id: number;
  team: Team | null;
}) {
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
    <Button color="green" size="xs" onClick={() => setOpened(true)} leftIcon={icon}>
      {operation_text}
    </Button>
  );

  const form = useForm({
    initialValues: {
      name: team == null ? '' : team.name,
      active: team == null ? false : team.active,
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
            if (is_create_form) createTeam(tournament_id, values.name, values.active);
            else updateTeam(tournament_id, team.id, values.name, values.active);
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

          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            Save
          </Button>
        </form>
      </Modal>

      {modalOpenButton}
    </>
  );
}
