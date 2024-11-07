import { Alert, Button, Container, Grid, Modal, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FaArrowRight } from '@react-icons/all-files/fa/FaArrowRight';
import { IconAlertCircle, IconSquareArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { StageItemWithRounds } from '../../interfaces/stage_item';
import { StageItemInput, formatStageItemInput } from '../../interfaces/stage_item_input';
import { TeamInterface } from '../../interfaces/team';
import { getStageItemLookup } from '../../services/lookups';
import { activateNextStage } from '../../services/stage';
import RequestErrorAlert from '../utils/error_alert';
import { GenericSkeleton } from '../utils/skeletons';

type Update = { stage_item_input: StageItemInput; team: TeamInterface };
type StageItemUpdate = { updates: Update[]; stageItem: StageItemWithRounds };

function UpdatesToStageItemInputsTable({
  stageItemsLookup,
  updates,
}: {
  stageItemsLookup: any;
  updates: Update[];
}) {
  return updates
    .sort((si1: Update, si2: Update) =>
      si1.stage_item_input.slot > si2.stage_item_input.slot ? 1 : -1
    )
    .map((update) => (
      <Grid>
        <Grid.Col span={{ sm: 6 }}>
          {formatStageItemInput(update.stage_item_input, stageItemsLookup)}
        </Grid.Col>
        <Grid.Col span={{ sm: 6 }}>
          <FaArrowRight style={{ marginRight: '0.5rem' }} />
          {update.team?.name}
        </Grid.Col>
      </Grid>
    ));
}

function UpdatesToStageItemInputsTables({
  stageItemsLookup,
  swrRankingsPerStageItemResponse,
}: {
  stageItemsLookup: any;
  swrRankingsPerStageItemResponse: SWRResponse;
}) {
  if (swrRankingsPerStageItemResponse.isLoading) {
    return <GenericSkeleton />;
  }
  if (swrRankingsPerStageItemResponse.error) {
    return <RequestErrorAlert error={swrRankingsPerStageItemResponse.error} />;
  }

  const items = swrRankingsPerStageItemResponse.data.data;
  return Object.keys(items)
    .map((stageItemId) => ({
      updates: items[stageItemId],
      stageItem: stageItemsLookup[stageItemId],
    }))
    .filter((item: StageItemUpdate) => item.stageItem != null)
    .sort((si1: StageItemUpdate, si2: StageItemUpdate) =>
      si1.stageItem.name > si2.stageItem.name ? 1 : -1
    )
    .map((item: StageItemUpdate) => (
      <>
        <Title size="h2" mt="1rem">
          {item.stageItem.name}
        </Title>
        <UpdatesToStageItemInputsTable updates={item.updates} stageItemsLookup={stageItemsLookup} />
      </>
    ));
}

export default function ActivateNextStageModal({
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
  const stageItemsLookup = getStageItemLookup(swrStagesResponse);

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

          <Container mt="1rem">
            <UpdatesToStageItemInputsTables
              swrRankingsPerStageItemResponse={swrRankingsPerStageItemResponse}
              stageItemsLookup={stageItemsLookup}
            />
          </Container>

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
