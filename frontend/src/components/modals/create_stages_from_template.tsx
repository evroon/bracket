import { Button, Grid, Modal, NumberInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import React from 'react';
import { SWRResponse } from 'swr';

import { Tournament } from '../../interfaces/tournament';
import { createStageItemFromSingleTemplate } from '../../services/stage_item';
import { Translator } from '../utils/types';
import { getTeamCount } from './create_stage_item';
import { StagePreviewRoundRobin } from './stage_preview';

interface FormValues {
  group_count_round_robin: number;
  group_size_round_robin: number;
  team_count_elimination: number;
}
export function CreateStagesFromTemplateModal({
  t,
  tournament,
  swrStagesResponse,
  swrAvailableInputsResponse,
  opened,
  setOpened,
  first_stage_type,
}: {
  t: Translator;
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
  swrAvailableInputsResponse: SWRResponse;
  opened: boolean;
  setOpened: (value: boolean) => void;
  first_stage_type: 'ROUND_ROBIN' | 'SWISS' | 'SINGLE_ELIMINATION';
}) {
  const form = useForm<FormValues>({
    initialValues: {
      group_count_round_robin: 4,
      group_size_round_robin: 4,
      team_count_elimination: 2,
    },
    validate: {
      group_count_round_robin: (value) => (value >= 2 ? null : t('at_least_two_team_validation')),
      group_size_round_robin: (value) => (value >= 2 ? null : t('at_least_two_team_validation')),
      team_count_elimination: (value) => (value >= 2 ? null : t('at_least_two_team_validation')),
    },
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('add_stage_item_modal_title')}
        size="90rem"
      >
        <form
          onSubmit={form.onSubmit(async (values) => {
            const teamCount = getTeamCount(values);
            await createStageItemFromSingleTemplate(tournament.id, first_stage_type, teamCount);
            await swrStagesResponse.mutate();
            await swrAvailableInputsResponse.mutate();
            setOpened(false);
          })}
        >
          <Grid>
            <Grid.Col span={{ base: 12, lg: 3 }}>
              <NumberInput
                withAsterisk
                label="Number of teams (Round Robin)"
                placeholder=""
                mt="1rem"
                {...form.getInputProps('group_count_round_robin')}
              />
              <NumberInput
                withAsterisk
                label="Team size (Round Robin)"
                placeholder=""
                mt="1rem"
                {...form.getInputProps('group_size_round_robin')}
              />
              <NumberInput
                withAsterisk
                label="Number of teams that advance to single elimination"
                placeholder=""
                mt="1rem"
                {...form.getInputProps('team_count_elimination')}
              />
              <Button fullWidth mt="1.5rem" color="green" type="submit">
                {t('create_stage_item_button')}
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 9 }}>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text ta="center" fw={800}>
                    Stage 1
                  </Text>
                  <StagePreviewRoundRobin
                    group_count={form.values.group_count_round_robin}
                    teams_per_group={form.values.group_size_round_robin}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text ta="center" fw={800}>
                    Stage 2
                  </Text>
                  <StagePreviewRoundRobin
                    group_count={1}
                    teams_per_group={form.values.team_count_elimination}
                  />
                </Grid.Col>
              </Grid>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>
    </>
  );
}
