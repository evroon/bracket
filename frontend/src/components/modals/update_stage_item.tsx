import { Button, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import React from 'react';
import { SWRResponse } from 'swr';

import { StageItemWithRounds } from '../../interfaces/stage_item';
import { Tournament } from '../../interfaces/tournament';
import { updateStageItem } from '../../services/stage_item';

export function UpdateStageItemModal({
  tournament,
  opened,
  setOpened,
  stageItem,
  swrStagesResponse,
}: {
  tournament: Tournament;
  opened: boolean;
  setOpened: any;
  stageItem: StageItemWithRounds;
  swrStagesResponse: SWRResponse;
}) {
  const form = useForm({
    initialValues: { name: stageItem.name },
    validate: {},
  });

  return (
    <Modal opened={opened} onClose={() => setOpened(false)} title="Edit stage item">
      <form
        onSubmit={form.onSubmit(async (values) => {
          await updateStageItem(tournament.id, stageItem.id, values.name);
          await swrStagesResponse.mutate(null);
        })}
      >
        <TextInput
          label="Name"
          placeholder=""
          required
          my="lg"
          type="text"
          {...form.getInputProps('name')}
        />
        <Button fullWidth style={{ marginTop: 16 }} color="green" type="submit">
          Save
        </Button>
      </form>
    </Modal>
  );
}
