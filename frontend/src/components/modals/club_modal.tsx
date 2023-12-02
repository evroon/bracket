import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { Club } from '../../interfaces/club';
import { createClub, updateClub } from '../../services/club';
import SaveButton from '../buttons/save';

export default function ClubModal({
  club,
  swrClubsResponse,
}: {
  club: Club | null;
  swrClubsResponse: SWRResponse;
}) {
  const is_create_form = club == null;
  const operation_text = is_create_form ? 'Create Club' : 'Edit Club';
  const icon = is_create_form ? <GoPlus size={20} /> : <BiEditAlt size={20} />;
  const [opened, setOpened] = useState(false);
  const modalOpenButton = is_create_form ? (
    <Group justify="right">
      <SaveButton
        onClick={() => setOpened(true)}
        leftSection={<GoPlus size={24} />}
        title={operation_text}
      />
    </Group>
  ) : (
    <Button
      color="green"
      size="xs"
      style={{ marginRight: 10 }}
      onClick={() => setOpened(true)}
      leftSection={icon}
    >
      {operation_text}
    </Button>
  );

  const form = useForm({
    initialValues: {
      name: club == null ? '' : club.name,
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
            if (is_create_form) await createClub(values.name);
            else await updateClub(club.id, values.name);
            await swrClubsResponse.mutate(null);
            setOpened(false);
          })}
        >
          <TextInput
            withAsterisk
            label="Name"
            placeholder="Best Club Ever"
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
