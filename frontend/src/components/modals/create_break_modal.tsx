import { Button, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateTimePicker } from '@mantine/dates';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import { TournamentBreaksResponse } from '@services/adapter';
import { createTournamentBreak } from '@services/tournament_break';

export default function BreakModal({
  tournamentId,
  swrBreaksResponse,
  buttonSize,
}: {
  buttonSize: 'xs' | 'lg';
  tournamentId: number;
  swrBreaksResponse: SWRResponse<TournamentBreaksResponse>;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const form = useForm({
    initialValues: {
      title: '',
      start_time: null as Dayjs | null,
      end_time: null as Dayjs | null,
    },

    validate: {
      title: (value) => (value.length > 0 ? null : t('too_short_name_validation')),
      start_time: (value) => (value != null ? null : t('break_start_time_label')),
      end_time: (value, values) => {
        if (value == null) return t('break_end_time_label');
        if (values.start_time != null && dayjs(value).isBefore(dayjs(values.start_time)))
          return t('end_time_after_start_validation');
        return null;
      },
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('add_break_title')}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            await createTournamentBreak(
              tournamentId,
              values.title,
              new Date(dayjs(values.start_time).valueOf()).toISOString(),
              new Date(dayjs(values.end_time).valueOf()).toISOString()
            );
            await swrBreaksResponse.mutate();
            setOpened(false);
            form.reset();
          })}
        >
          <TextInput
            withAsterisk
            label={t('name_input_label')}
            placeholder={t('break_name_input_placeholder')}
            {...form.getInputProps('title')}
          />

          <DateTimePicker
            withAsterisk
            label={t('break_start_time_label')}
            mt="md"
            {...form.getInputProps('start_time')}
          />

          <DateTimePicker
            withAsterisk
            label={t('break_end_time_label')}
            mt="md"
            {...form.getInputProps('end_time')}
          />

          <Button fullWidth style={{ marginTop: 10 }} color="orange" type="submit">
            {t('save_button')}
          </Button>
        </form>
      </Modal>
      <Button
        variant="outline"
        color="orange"
        size={buttonSize}
        style={{ marginRight: 10 }}
        onClick={() => setOpened(true)}
        leftSection={<GoPlus size={24} />}
      >
        {t('add_break_title')}
      </Button>
    </>
  );
}
