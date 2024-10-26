import { Button, Modal, NumberInput, Select } from '@mantine/core';
import { UseFormReturnType, useForm } from '@mantine/form';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { StageWithStageItems } from '../../interfaces/stage';
import { Tournament } from '../../interfaces/tournament';
import { getAvailableStageItemInputs } from '../../services/adapter';
import { getStageItemLookup, getTeamsLookup } from '../../services/lookups';
import { createStageItem } from '../../services/stage_item';

function TeamCountSelectElimination({ form }: { form: UseFormReturnType<any> }) {
  const { t } = useTranslation();
  const data = [
    { value: '2', label: '2' },
    { value: '4', label: '4' },
    { value: '8', label: '8' },
  ];
  return (
    <Select
      withAsterisk
      data={data}
      label={t('team_count_select_elimination_label')}
      placeholder={t('team_count_select_elimination_placeholder')}
      searchable
      limit={20}
      mt={24}
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
      mt={24}
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

  const form = useForm({
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
          <Select
            withAsterisk
            label={t('stage_type_select_label')}
            allowDeselect={false}
            data={[
              { value: 'ROUND_ROBIN', label: t('round_robin_label') },
              { value: 'SINGLE_ELIMINATION', label: t('single_elimination_label') },
              { value: 'SWISS', label: t('swiss_label') },
            ]}
            {...form.getInputProps('type')}
          />
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
