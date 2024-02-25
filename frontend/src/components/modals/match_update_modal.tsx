import { ActionIcon, Button, Modal, NumberInput } from '@mantine/core';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { SWRResponse } from 'swr';
import { useForm } from '@mantine/form';
import { MatchInterface } from '../../interfaces/match';
import { updateMatch } from '../../services/match';
import { requestSucceeded } from '../../services/adapter';

export default function MatchUpdateModal({
  tournament_id,
  match,
  swrMatchResponse,
}: {
  tournament_id: number;
  match: MatchInterface;
  swrMatchResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      custom_duration_minutes: match.custom_duration_minutes,
      custom_margin_minutes: match.custom_margin_minutes,
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('edit_match_modal_title')}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            const updatedMatch = { ...match,
              // @ts-ignore
              custom_duration_minutes: values.custom_duration_minutes === '' ? null : values.custom_duration_minutes,
              // @ts-ignore
              custom_margin_minutes: values.custom_margin_minutes === '' ? null : values.custom_margin_minutes,
            };

            await updateMatch(tournament_id, match.id, updatedMatch);
            await swrMatchResponse.mutate();
            setOpened(false);
          })}
        >
          <NumberInput
            label={t('custom_match_duration_label')}
            placeholder={match.duration_minutes.toString()}
            {...form.getInputProps('custom_duration_minutes')}
          />

          <NumberInput
            label={t('custom_match_margin_label')}
            placeholder={match.margin_minutes.toString()}
            mb="12rem"
            {...form.getInputProps('custom_margin_minutes')}
          />

          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            {t('save_button')}
          </Button>
        </form>
      </Modal>

      <ActionIcon
        color="green"
        radius="lg"
        size={26}
        onClick={() => setOpened(true)}
      >
        <BiEditAlt size={20} />
      </ActionIcon>
    </>
  );
}
