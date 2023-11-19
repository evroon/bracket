import { Button, Checkbox, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconSquareArrowRight } from '@tabler/icons-react';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { StageItemWithRounds } from '../../interfaces/stage_item';
import { startNextRound } from '../../services/round';

export default function ActivateNextRoundModal({
  tournamentId,
  stageItem,
  swrStagesResponse,
}: {
  tournamentId: number;
  stageItem: StageItemWithRounds;
  swrStagesResponse: SWRResponse;
}) {
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      adjust_to_time: false,
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Activate next round">
        <form
          onSubmit={form.onSubmit(async (values) => {
            await startNextRound(
              tournamentId,
              stageItem.id,
              values.adjust_to_time ? new Date() : null
            );
            await swrStagesResponse.mutate();
            setOpened(false);
          })}
        >
          <Checkbox
            mt="lg"
            label="Force start time of matches to current time"
            {...form.getInputProps('adjust_to_time', { type: 'checkbox' })}
          />
          <Button
            fullWidth
            color="indigo"
            size="md"
            mt="lg"
            type="submit"
            leftIcon={<IconSquareArrowRight size={24} />}
            onClick={async () => {
              await startNextRound(tournamentId, stageItem.id, new Date());
              await swrStagesResponse.mutate();
              setOpened(false);
            }}
          >
            Start next round
          </Button>
        </form>
      </Modal>

      <Button
        color="indigo"
        size="md"
        leftIcon={<IconSquareArrowRight size={24} />}
        onClick={() => setOpened(true)}
      >
        Activate next round
      </Button>
    </>
  );
}
