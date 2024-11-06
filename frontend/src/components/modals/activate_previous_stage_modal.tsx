import { Alert, Button, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconSquareArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { activateNextStage } from '../../services/stage';

export default function ActivatePreviousStageModal({
  tournamentId,
  swrStagesResponse,
  swrRankingsPerStageItemResponse,
}: {
  tournamentId: number;
  swrStagesResponse: SWRResponse;
  swrRankingsPerStageItemResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {},
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('active_previous_stage_modal_title')}
        size="40rem"
      >
        <form
          onSubmit={form.onSubmit(async () => {
            await activateNextStage(tournamentId, 'previous');
            swrStagesResponse.mutate();
            swrRankingsPerStageItemResponse.mutate();
            setOpened(false);
          })}
        >
          <Alert icon={<IconAlertCircle size={16} />} color="orange" radius="lg">
            {t('active_previous_stage_modal_description')}
          </Alert>

          <Button
            fullWidth
            color="indigo"
            size="md"
            mt="lg"
            type="submit"
            leftSection={<IconSquareArrowLeft size={24} />}
          >
            {t('plan_previous_stage_button')}
          </Button>
        </form>
      </Modal>

      <Button
        size="md"
        mb="10"
        color="indigo"
        leftSection={<IconSquareArrowLeft size={24} />}
        onClick={async () => {
          setOpened(true);
        }}
      >
        {t('previous_stage_button')}
      </Button>
    </>
  );
}
