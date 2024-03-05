import { ActionIcon, Button, Divider, Modal, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { MatchInterface } from '../../interfaces/match';
import { updateMatch } from '../../services/match';
import CommonCustomTimeMatchesForm from '../forms/common_custom_times_matches';
import { DateTimePicker } from '@mantine/dates';

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
    validate: {
      custom_duration_minutes: (value) =>
        value == null || value >= 0 ? null : t('negative_match_duration_validation'),
      custom_margin_minutes: (value) =>
        value == null || value >= 0 ? null : t('negative_match_margin_validation'),
    },
  });

  const [customDurationEnabled, setCustomDurationEnabled] = useState(
    match.custom_duration_minutes != null
  );
  const [customMarginEnabled, setCustomMarginEnabled] = useState(
    match.custom_margin_minutes != null
  );

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('edit_match_modal_title')}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            const updatedMatch = {
              ...match,
              custom_duration_minutes: customDurationEnabled
                ? values.custom_duration_minutes
                : null,
              custom_margin_minutes: customMarginEnabled ? values.custom_margin_minutes : null,
            };

            await updateMatch(tournament_id, match.id, updatedMatch);
            await swrMatchResponse.mutate();
            setOpened(false);
          })}
        >
          <CommonCustomTimeMatchesForm
            customDurationEnabled={customDurationEnabled}
            customMarginEnabled={customMarginEnabled}
            form={form}
            match={match}
            setCustomDurationEnabled={setCustomDurationEnabled}
            setCustomMarginEnabled={setCustomMarginEnabled}
          />

          {/* <Divider mt="sm" />

          <DateTimePicker mt="sm" /> */}

          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            {t('save_button')}
          </Button>
        </form>
      </Modal>

      <ActionIcon color="green" radius="lg" size={26} onClick={() => setOpened(true)}>
        <BiEditAlt size={20} />
      </ActionIcon>
    </>
  );
}
