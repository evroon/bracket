import { Alert, Button, Checkbox, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconSquareArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { MdOutlineAutoFixHigh } from 'react-icons/md';
import { SWRResponse } from 'swr';

import { StageItemWithRounds } from '../../interfaces/stage_item';
import { startNextRound } from '../../services/round';

export default function ActivateNextRoundModal({
  tournamentId,
  stageItem,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
}: {
  tournamentId: number;
  stageItem: StageItemWithRounds;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      adjust_to_time: false,
    },
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('active_next_round_modal_title')}
        size="40rem"
      >
        <form
          onSubmit={form.onSubmit(async (values) => {
            await startNextRound(
              tournamentId,
              stageItem.id,
              values.adjust_to_time ? new Date() : null
            );
            await swrStagesResponse.mutate();
            await swrUpcomingMatchesResponse.mutate();
            setOpened(false);
          })}
        >
          <Alert icon={<IconAlertCircle size={16} />} color="gray" radius="lg">
            {t('active_next_round_modal_description')}
            <br />
            <br />
            {t('active_next_round_modal_choose_description')}
            <ul>
              <li>
                <b>{t('checkbox_status_unchecked')}</b>:{' '}
                {t('active_next_round_modal_choose_option_unchecked')}
              </li>
              <li>
                <b>{t('checkbox_status_checked')}</b>:{' '}
                {t('active_next_round_modal_choose_option_checked')}
              </li>
            </ul>
          </Alert>

          <Checkbox
            mt="lg"
            label={t('adjust_start_times_checkbox_label')}
            {...form.getInputProps('adjust_to_time', { type: 'checkbox' })}
          />
          <Button
            fullWidth
            color="indigo"
            size="md"
            mt="lg"
            type="submit"
            leftSection={<IconSquareArrowRight size={24} />}
          >
            {t('auto_create_matches_button')}
          </Button>
        </form>
      </Modal>

      <Button
        color="indigo"
        size="md"
        variant="outline"
        leftSection={<MdOutlineAutoFixHigh size={24} />}
        onClick={() => setOpened(true)}
      >
        {t('auto_create_matches_button')}
      </Button>
    </>
  );
}
