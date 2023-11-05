import { Button, Divider, Modal, NumberInput, Select } from '@mantine/core';
import { UseFormReturnType, useForm } from '@mantine/form';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import assert from 'assert';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { StageWithStageItems } from '../../interfaces/stage';
import { StageItemInputOption, formatStageItemInput } from '../../interfaces/stage_item_input';
import { Tournament } from '../../interfaces/tournament';
import { getAvailableStageItemInputs } from '../../services/adapter';
import { getStageItemLookup, getTeamsLookup } from '../../services/lookups';
import { createStageItem } from '../../services/stage_item';
import { responseIsValid } from '../utils/util';

function TeamCountSelectElimination({ form }: { form: UseFormReturnType<any> }) {
  const data = [
    { value: '2', label: '2' },
    { value: '4', label: '4' },
    { value: '8', label: '8' },
  ];
  return (
    <Select
      withAsterisk
      data={data}
      label="Number of teams advancing from the previous stage"
      placeholder="2, 4, 8 etc."
      searchable
      limit={20}
      mt={24}
      {...form.getInputProps('team_count_elimination')}
    />
  );
}

function TeamCountInputRoundRobin({ form }: { form: UseFormReturnType<any> }) {
  return (
    <NumberInput
      withAsterisk
      label="Number of teams advancing from the previous stage"
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

function StageItemInput({
  form,
  possibleOptions,
  index,
}: {
  form: UseFormReturnType<any>;
  index: number;
  possibleOptions: any[];
}) {
  return (
    <Select
      withAsterisk
      data={possibleOptions}
      label={`Team ${index}`}
      placeholder="None"
      searchable
      limit={20}
      mt={24}
      {...form.getInputProps(`team_${index}`)}
    />
  );
}

function getTeamCount(values: any) {
  return Number(
    values.type === 'SINGLE_ELIMINATION'
      ? values.team_count_elimination
      : values.team_count_round_robin
  );
}

function StageItemInputs({
  form,
  possibleOptions,
}: {
  form: UseFormReturnType<any>;
  possibleOptions: any[];
}) {
  return Array.from(Array(Math.max(getTeamCount(form.values), 2)).keys()).map((x) => (
    <StageItemInput possibleOptions={possibleOptions} form={form} index={x + 1} key={x} />
  ));
}

export function CreateStageItemModal({
  tournament,
  stage,
  swrStagesResponse,
}: {
  tournament: Tournament;
  stage: StageWithStageItems;
  swrStagesResponse: SWRResponse;
}) {
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: { type: 'ROUND_ROBIN', team_count_round_robin: 2, team_count_elimination: 2 },
    validate: {
      team_count_round_robin: (value) => (value >= 2 ? null : 'Need at least two teams'),
      team_count_elimination: (value) => (value >= 2 ? null : 'Need at least two teams'),
    },
  });

  const teamsMap = getTeamsLookup(tournament != null ? tournament.id : -1);
  const stageItemMap = getStageItemLookup(swrStagesResponse);

  if (teamsMap == null || stageItemMap == null) {
    return null;
  }

  const swrAvailableInputsResponse: SWRResponse = getAvailableStageItemInputs(
    tournament.id,
    stage.id
  );
  const availableInputs = responseIsValid(swrAvailableInputsResponse)
    ? swrAvailableInputsResponse.data.data.map((option: StageItemInputOption) => {
        if (option.winner_from_stage_item_id == null) {
          if (option.team_id == null) return null;
          const team = teamsMap[option.team_id];
          if (team == null) return null;
          return {
            value: option.team_id,
            label: team.name,
          };
        }
        assert(option.winner_position_in_stage_item != null);
        const stageItem = stageItemMap[option.winner_from_stage_item_id];
        if (stageItem == null) return null;
        return {
          value: `${option.winner_from_stage_item_id}_${option.winner_position_in_stage_item}`,
          label: `${formatStageItemInput(option.winner_position_in_stage_item, stageItem.name)}`,
        };
      })
    : {};

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Add stage item">
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
                winner_position_in_stage_item:
                  typeof teamId === 'string' ? Number(teamId.split('_')[1]) : null,
              };
            });
            await createStageItem(tournament.id, stage.id, values.type, teamCount, inputs);
            await swrStagesResponse.mutate(null);
          })}
        >
          <Select
            withAsterisk
            label="Stage Type"
            data={[
              { value: 'ROUND_ROBIN', label: 'Round Robin' },
              { value: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
              { value: 'SWISS', label: 'Swiss' },
            ]}
            {...form.getInputProps('type')}
          />
          <TeamCountInput form={form} />
          <Divider mt={24} />
          <StageItemInputs form={form} possibleOptions={availableInputs} />

          <Button fullWidth style={{ marginTop: 16 }} color="green" type="submit">
            Create Stage Item
          </Button>
        </form>
      </Modal>

      <Button
        variant="outline"
        color="green"
        size="xs"
        style={{ marginRight: 10 }}
        onClick={() => setOpened(true)}
        leftIcon={<GoPlus size={24} />}
      >
        Add stage item
      </Button>
    </>
  );
}
