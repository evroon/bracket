import {
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Image,
  Modal,
  NumberInput,
  Select,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { UseFormReturnType, useForm } from '@mantine/form';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { StageWithStageItems } from '../../interfaces/stage';
import { Tournament } from '../../interfaces/tournament';
import { getStageItemLookup, getTeamsLookup } from '../../services/lookups';
import { createStageItem, createStageItemFromSingleTemplate } from '../../services/stage_item';
import { Translator } from '../utils/types';
import { CreateStagesFromTemplateButtons, TeamCountInput, getTeamCount } from './create_stage_item';
import classes from './create_stage_item.module.css';
import { StagePreviewRoundRobin } from './stage_preview';

interface FormValues {
  type: 'ROUND_ROBIN' | 'SWISS' | 'SINGLE_ELIMINATION';
  team_count_round_robin: number;
  team_count_elimination: number;
}
export function CreateStagesFromTemplateModal({
  t,
  tournament,
  stage,
  swrStagesResponse,
  swrAvailableInputsResponse,
  opened,
  setOpened,
  initial_type,
}: {
  t: Translator;
  tournament: Tournament;
  stage: StageWithStageItems;
  swrStagesResponse: SWRResponse;
  swrAvailableInputsResponse: SWRResponse;
  opened: boolean;
  setOpened: (value: boolean) => void;
  initial_type: 'ROUND_ROBIN' | 'SWISS' | 'SINGLE_ELIMINATION';
}) {
  const form = useForm<FormValues>({
    initialValues: { type: initial_type, team_count_round_robin: 4, team_count_elimination: 2 },
    validate: {
      team_count_round_robin: (value) => (value >= 2 ? null : t('at_least_two_team_validation')),
      team_size_round_robin: (value) => (value >= 2 ? null : t('at_least_two_team_validation')),
      team_count_elimination: (value) => (value >= 2 ? null : t('at_least_two_team_validation')),
    },
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('add_stage_item_modal_title')}
        size="60rem"
      >
        <form
          onSubmit={form.onSubmit(async (values) => {
            const teamCount = getTeamCount(values);
            const inputs = Array.from(Array(teamCount).keys()).map((i) => {
              const teamId = values[`team_${i + 1}` as keyof typeof values];
              return {
                slot: i + 1,
                team_id: Number(teamId),
                winner_from_stage_item_id:
                  typeof teamId === 'string' ? Number(teamId.split('_')[0]) : null,
                winner_position: typeof teamId === 'string' ? Number(teamId.split('_')[1]) : null,
              };
            });
            if (stage !== null) {
              await createStageItem(tournament.id, stage.id, values.type, teamCount, inputs);
            } else {
              await createStageItemFromSingleTemplate(
                tournament.id,
                values.type,
                teamCount,
                inputs
              );
            }
            await swrStagesResponse.mutate();
            await swrAvailableInputsResponse.mutate();
            setOpened(false);
          })}
        >
          <Grid>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <StagePreviewRoundRobin group_count={5} teams_per_group={5} />
            </Grid.Col>
          </Grid>
          <Divider mt="1rem" />
          <Grid>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <NumberInput
                withAsterisk
                label={'Number of teams (Round Robin)'}
                placeholder=""
                mt="1rem"
                {...form.getInputProps('team_count_round_robin')}
              />
              <NumberInput
                withAsterisk
                label={'Team size (Round Robin)'}
                placeholder=""
                mt="1rem"
                {...form.getInputProps('team_count_round_robin')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <NumberInput
                withAsterisk
                label={'Number of teams that advance to single elimination'}
                placeholder=""
                mt="1rem"
                {...form.getInputProps('team_count_round_robin')}
              />
            </Grid.Col>
          </Grid>

          <Button fullWidth mt="1.5rem" color="green" type="submit">
            {t('create_stage_item_button')}
          </Button>
        </form>
      </Modal>
    </>
  );
}
