import { Button, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { createCourt } from '../../services/court';

export default function CourtModal({
  tournamentId,
  swrCourtsResponse,
  buttonSize,
}: {
  buttonSize: 'xs' | 'lg';
  tournamentId: number;
  swrCourtsResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const form = useForm({
    initialValues: {
      name: '',
    },

    validate: {
      name: (value) => (value.length > 0 ? null : t('too_short_name_validation')),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('add_court_title')}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            await createCourt(tournamentId, values.name);
            await swrCourtsResponse.mutate();
            setOpened(false);
          })}
        >
          <TextInput
            withAsterisk
            label={t('name_input_label')}
            placeholder={t('court_name_input_placeholder')}
            {...form.getInputProps('name')}
          />

          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            {t('save_button')}
          </Button>
        </form>
      </Modal>
      <Button
        variant="outline"
        color="green"
        size={buttonSize}
        style={{ marginRight: 10 }}
        onClick={() => setOpened(true)}
        leftSection={<GoPlus size={24} />}
      >
        {t('add_court_title')}
      </Button>
    </>
  );
}
