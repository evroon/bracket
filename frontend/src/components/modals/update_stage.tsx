import { Button, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { StageWithStageItems } from '../../interfaces/stage';
import { Tournament } from '../../interfaces/tournament';
import { updateStage } from '../../services/stage';

export function UpdateStageModal({
  tournament,
  opened,
  setOpened,
  stage,
  swrStagesResponse,
}: {
  tournament: Tournament;
  opened: boolean;
  setOpened: any;
  stage: StageWithStageItems;
  swrStagesResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const form = useForm({
    initialValues: { name: stage.name },
    validate: {},
  });

  return (
    <Modal opened={opened} onClose={() => setOpened(false)} title="Edit stage">
      <form
        onSubmit={form.onSubmit(async (values) => {
          await updateStage(tournament.id, stage.id, values.name);
          await swrStagesResponse.mutate();
        })}
      >
        <TextInput
          label={t('name_input_label')}
          placeholder=""
          required
          my="lg"
          type="text"
          {...form.getInputProps('name')}
        />
        <Button fullWidth style={{ marginTop: 16 }} color="green" type="submit">
          {t('save_button')}
        </Button>
      </form>
    </Modal>
  );
}
