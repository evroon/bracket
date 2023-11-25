import { Alert, Button, Checkbox, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconSquareArrowRight } from '@tabler/icons-react';
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
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Assign times and courts to matches of next round"
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
            setOpened(false);
          })}
        >
          <Alert icon={<IconAlertCircle size={16} />} color="gray" radius="lg">
            This will assign times and courts to matches of next round, which is the round after the
            current activated (green) round.
            <br />
            <br />
            You can choose to either (check the checkbox or not):
            <ul>
              <li>
                <b>Unchecked</b>: Use default timing (the next matches will be planned tightly after
                the matches of the active round end)
              </li>
              <li>
                <b>Checked</b>: Adjust the start times of the next matches to start immediately
                (now). This will be done by modifying the margin times of the matches in the
                previous round.
              </li>
            </ul>
          </Alert>

          <Checkbox
            mt="lg"
            label="Adjust start time of matches in this round to the current time"
            {...form.getInputProps('adjust_to_time', { type: 'checkbox' })}
          />
          <Button
            fullWidth
            color="indigo"
            size="md"
            mt="lg"
            type="submit"
            leftIcon={<IconSquareArrowRight size={24} />}
          >
            Plan next round
          </Button>
        </form>
      </Modal>

      <Button
        color="indigo"
        size="md"
        leftIcon={<IconSquareArrowRight size={24} />}
        onClick={() => setOpened(true)}
      >
        Plan next round
      </Button>
    </>
  );
}
