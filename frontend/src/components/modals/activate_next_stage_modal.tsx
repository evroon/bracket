import { Alert, Button, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconSquareArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { activateNextStage } from '../../services/stage';

export default function ActivateNextStageModal({
  tournamentId,
  swrStagesResponse,
}: {
  tournamentId: number;
  swrStagesResponse: SWRResponse;
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
        title={t('active_next_stage_modal_title')}
        size="40rem"
      >
        <form
          onSubmit={form.onSubmit(async () => {
            await activateNextStage(tournamentId, 'next');
            swrStagesResponse.mutate();
            setOpened(false);
          })}
        >
          <Alert icon={<IconAlertCircle size={16} />} color="gray" radius="lg">
            {t('active_next_stage_modal_description')}
          </Alert>

          <Button
            fullWidth
            color="indigo"
            size="md"
            mt="lg"
            type="submit"
            leftSection={<IconSquareArrowRight size={24} />}
          >
            {t('plan_next_stage_button')}
          </Button>
        </form>
      </Modal>

      <Button
        size="md"
        mb="10"
        color="indigo"
        leftSection={<IconSquareArrowRight size={24} />}
        onClick={async () => {
          setOpened(true);
        }}
      >
        {t('next_stage_button')}
      </Button>
    </>
  );
}
