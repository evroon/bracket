import {
  Button,
  Card,
  Divider,
  Grid,
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
import { createStageItem } from '../../services/stage_item';
import { Translator } from '../utils/types';
import classes from './create_stage_item.module.css';

function StageSelectCard({
  title,
  description,
  image,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  image: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <UnstyledButton onClick={onClick} w="100%">
      <Card
        shadow="sm"
        padding="lg"
        radius="lg"
        h="23rem"
        withBorder
        className={classes.socialLink}
        style={{ border: selected ? '3px solid var(--mantine-color-green-7)' : '' }}
      >
        <Card.Section style={{ backgroundColor: '#dde' }}>
          <Image src={image} h={212} style={{ padding: '1.5rem' }} fit="fill"></Image>
        </Card.Section>

        <Text fw={800} size="xl" mt="md" lineClamp={1}>
          {title}
        </Text>

        <Text mt="xs" c="dimmed" size="md" lineClamp={3}>
          {description}
        </Text>
      </Card>
    </UnstyledButton>
  );
}

export function CreateStagesFromTemplateButtons({
  selectedType,
  setSelectedType,
  t,
}: {
  selectedType: 'ROUND_ROBIN' | 'SWISS' | 'SINGLE_ELIMINATION';
  setSelectedType: (type: 'ROUND_ROBIN' | 'SWISS' | 'SINGLE_ELIMINATION') => void;
  t: Translator;
}) {
  return (
    <Grid grow>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <StageSelectCard
          title={t('round_robin_label')}
          description={t('round_robin_description')}
          image="/icons/group-stage-item.svg"
          selected={selectedType === 'ROUND_ROBIN'}
          onClick={() => {
            setSelectedType('ROUND_ROBIN');
          }}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <StageSelectCard
          title={t('single_elimination_label')}
          description={t('single_elimination_description')}
          image="/icons/single-elimination-stage-item.svg"
          selected={selectedType === 'SINGLE_ELIMINATION'}
          onClick={() => {
            setSelectedType('SINGLE_ELIMINATION');
          }}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <StageSelectCard
          title={t('swiss_label')}
          description={t('swiss_description')}
          image="/icons/swiss-stage-item.svg"
          selected={selectedType === 'SWISS'}
          onClick={() => {
            setSelectedType('SWISS');
          }}
        />
      </Grid.Col>
    </Grid>
  );
}

function TeamCountSelectElimination({ form }: { form: UseFormReturnType<any> }) {
  const { t } = useTranslation();
  const data = [
    { value: '2', label: '2' },
    { value: '4', label: '4' },
    { value: '8', label: '8' },
    { value: '16', label: '16' },
    { value: '32', label: '32' },
  ];
  return (
    <Select
      withAsterisk
      data={data}
      label={t('team_count_select_elimination_label')}
      placeholder={t('team_count_select_elimination_placeholder')}
      searchable
      limit={20}
      mt="1rem"
      maw="50%"
      {...form.getInputProps('team_count_elimination')}
    />
  );
}

function TeamCountInputRoundRobin({ form }: { form: UseFormReturnType<any> }) {
  const { t } = useTranslation();
  return (
    <NumberInput
      withAsterisk
      label={t('team_count_input_round_robin_label')}
      placeholder=""
      mt="1rem"
      maw="50%"
      {...form.getInputProps('team_count_round_robin')}
    />
  );
}

function TeamCountInput({ form }: { form: UseFormReturnType<any> }) {
  if (form.values.type === 'SINGLE_ELIMINATION') {
    return <TeamCountSelectElimination form={form} />;
  }

  return <TeamCountInputRoundRobin form={form} />;
}

function getTeamCount(values: any) {
  return Number(
    values.type === 'SINGLE_ELIMINATION'
      ? values.team_count_elimination
      : values.team_count_round_robin
  );
}

interface FormValues {
  type: 'ROUND_ROBIN' | 'SWISS' | 'SINGLE_ELIMINATION';
  team_count_round_robin: number;
  team_count_elimination: number;
}
export function CreateStageItemModal({
  tournament,
  stage,
  swrStagesResponse,
  swrAvailableInputsResponse,
}: {
  tournament: Tournament;
  stage: StageWithStageItems;
  swrStagesResponse: SWRResponse;
  swrAvailableInputsResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const form = useForm<FormValues>({
    initialValues: { type: 'ROUND_ROBIN', team_count_round_robin: 4, team_count_elimination: 2 },
    validate: {
      team_count_round_robin: (value) => (value >= 2 ? null : t('at_least_two_team_validation')),
      team_count_elimination: (value) => (value >= 2 ? null : t('at_least_two_team_validation')),
    },
  });

  // TODO: Refactor lookups into one request.
  const teamsMap = getTeamsLookup(tournament != null ? tournament.id : -1);
  const stageItemMap = getStageItemLookup(swrStagesResponse);

  if (teamsMap == null || stageItemMap == null) {
    return null;
  }

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
            await createStageItem(tournament.id, stage.id, values.type, teamCount, inputs);
            await swrStagesResponse.mutate();
            await swrAvailableInputsResponse.mutate();
            setOpened(false);
          })}
        >
          <CreateStagesFromTemplateButtons
            t={t}
            selectedType={form.values.type}
            setSelectedType={(_type) => {
              form.setFieldValue('type', _type);
            }}
          />
          <Divider mt="1rem" />
          <TeamCountInput form={form} />

          <Button fullWidth mt="1.5rem" color="green" type="submit">
            {t('create_stage_item_button')}
          </Button>
        </form>
      </Modal>

      <Button
        variant="outline"
        color="green"
        size="xs"
        onClick={() => setOpened(true)}
        leftSection={<GoPlus size={24} />}
      >
        {t('add_stage_item_modal_title')}
      </Button>
    </>
  );
}
