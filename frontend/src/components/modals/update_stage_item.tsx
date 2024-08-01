import { Button, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { Ranking } from '../../interfaces/ranking';
import { StageItemWithRounds } from '../../interfaces/stage_item';
import { Tournament } from '../../interfaces/tournament';
import { updateStageItem } from '../../services/stage_item';
import { RankingSelect } from '../select/ranking_select';

export function UpdateStageItemModal({
  tournament,
  opened,
  setOpened,
  stageItem,
  swrStagesResponse,
  rankings,
}: {
  tournament: Tournament;
  opened: boolean;
  setOpened: any;
  stageItem: StageItemWithRounds;
  swrStagesResponse: SWRResponse;
  rankings: Ranking[];
}) {
  const { t } = useTranslation();
  const form = useForm({
    initialValues: {
      name: stageItem.name,
      ranking_id: rankings.filter((ranking) => ranking.position === 0)[0].id.toString(),
    },
    validate: {},
  });

  return (
    <Modal opened={opened} onClose={() => setOpened(false)} title={t('edit_stage_item_label')}>
      <form
        onSubmit={form.onSubmit(async (values) => {
          await updateStageItem(tournament.id, stageItem.id, values.name, values.ranking_id);
          await swrStagesResponse.mutate();
          setOpened(false);
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
        <RankingSelect form={form} rankings={rankings} />
        <Button fullWidth style={{ marginTop: 16 }} color="green" type="submit">
          {t('save_button')}
        </Button>
      </form>
    </Modal>
  );
}
