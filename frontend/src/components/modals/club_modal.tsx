import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation();
  const is_create_form = club == null;
  const operation_text = is_create_form ? t('create_club_button') : t('edit_club_button');
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
      name: (value) => (value.length > 0 ? null : t('too_short_name_validation')),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={operation_text}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            if (is_create_form) await createClub(values.name);
            else await updateClub(club.id, values.name);
            await swrClubsResponse.mutate();
            setOpened(false);
          })}
        >
          <TextInput
            withAsterisk
            label={t('name_input_label')}
            placeholder={t('club_name_input_placeholder')}
            {...form.getInputProps('name')}
          />

          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            {t('save_button')}
          </Button>
        </form>
      </Modal>

      {modalOpenButton}
    </>
  );
}
