import {
  ActionIcon,
  Badge,
  Card,
  Combobox,
  Group,
  Input,
  InputBase,
  Menu,
  Stack,
  Text,
  useCombobox,
} from '@mantine/core';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import assert from 'assert';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React, { useState } from 'react';
import { BiSolidWrench } from 'react-icons/bi';
import { SWRResponse } from 'swr';

import { Ranking } from '../../interfaces/ranking';
import { StageWithStageItems } from '../../interfaces/stage';
import { StageItemWithRounds } from '../../interfaces/stage_item';
import {
  StageItemInput,
  StageItemInputChoice,
  StageItemInputOption,
  formatStageItemInput,
} from '../../interfaces/stage_item_input';
import { Tournament } from '../../interfaces/tournament';
import { getStageItemLookup, getTeamsLookup } from '../../services/lookups';
import { deleteStage } from '../../services/stage';
import { deleteStageItem } from '../../services/stage_item';
import { updateStageItemInput } from '../../services/stage_item_input';
import CreateStageButton from '../buttons/create_stage';
import { CreateStageItemModal } from '../modals/create_stage_item';
import { UpdateStageModal } from '../modals/update_stage';
import { UpdateStageItemModal } from '../modals/update_stage_item';
import RequestErrorAlert from '../utils/error_alert';
import { responseIsValid } from '../utils/util';

function StageItemInputComboBox({
  tournament,
  stageItemInput,
  current_key,
  availableInputs,
  swrAvailableInputsResponse,
  swrStagesResponse,
}: {
  tournament: Tournament;
  stageItemInput: StageItemInput;
  current_key: string | null;
  availableInputs: StageItemInputChoice[];
  swrAvailableInputsResponse: SWRResponse;
  swrStagesResponse: SWRResponse;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [selectedInput, setSelectedInput] = useState<string | null>(current_key);

  const options = availableInputs.map((option: StageItemInputChoice, i: number) => (
    <Combobox.Option key={i} value={option.value}>
      {option.label || <i>None</i>}
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        const option = availableInputs.find((o) => o.value === val);
        setSelectedInput(val);
        updateStageItemInput(
          tournament.id,
          stageItemInput.stage_item_id,
          stageItemInput.id,
          option?.team_id || null,
          option?.winner_position || null,
          option?.winner_from_stage_item_id || null
        );
        swrAvailableInputsResponse.mutate();
        swrStagesResponse.mutate();
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          radius="0.5rem"
          component="button"
          type="button"
          pointer
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
          style={{ border: '0rem' }}
        >
          {availableInputs.find((o) => o.value === selectedInput)?.label || (
            <Input.Placeholder>Pick value</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export function getAvailableInputs(
  swrAvailableInputsResponse: SWRResponse,
  teamsMap: any,
  stageItemMap: any
) {
  const getComboBoxOptionForStageItemInput = (option: StageItemInputOption) => {
    if (option.winner_from_stage_item_id == null) {
      if (option.team_id == null) return null;
      const team = teamsMap[option.team_id];
      if (team == null) return null;
      assert(option.team_id === team.id);
      return {
        value: `${option.team_id}`,
        label: team.name,
        team_id: team.id,
        winner_from_stage_item_id: null,
        winner_position: null,
      };
    }

    assert(option.winner_position != null);
    const stageItem = stageItemMap[option.winner_from_stage_item_id];

    if (stageItem == null) return null;
    return {
      value: `${option.winner_from_stage_item_id}_${option.winner_position}`,
      label: `${formatStageItemInput(option.winner_position, stageItem.name)}`,
      team_id: null,
      winner_from_stage_item_id: option.winner_from_stage_item_id,
      winner_position: option.winner_position,
    };
  };
  return responseIsValid(swrAvailableInputsResponse)
    ? Object.keys(swrAvailableInputsResponse.data.data).reduce((result: any, stage_id: string) => {
        const option = swrAvailableInputsResponse.data.data[stage_id];
        result[stage_id] = option.map((opt: StageItemInputOption) =>
          getComboBoxOptionForStageItemInput(opt)
        );
        return result;
      }, {})
    : {};
}

function StageItemInputSectionLast({
  tournament,
  stageItemInput,
  currentOptionValue,
  lastInList,
  availableInputs,
  swrAvailableInputsResponse,
  swrStagesResponse,
}: {
  tournament: Tournament;
  stageItemInput: StageItemInput;
  currentOptionValue: string | null;
  lastInList: boolean;
  availableInputs: StageItemInputChoice[];
  swrAvailableInputsResponse: SWRResponse;
  swrStagesResponse: SWRResponse;
}) {
  const opts = lastInList ? { pt: 'xs', mb: '-0.5rem' } : { py: 'xs', withBorder: true };

  return (
    <Card.Section inheritPadding {...opts}>
      <StageItemInputComboBox
        tournament={tournament}
        stageItemInput={stageItemInput}
        current_key={currentOptionValue}
        availableInputs={availableInputs}
        swrAvailableInputsResponse={swrAvailableInputsResponse}
        swrStagesResponse={swrStagesResponse}
      />
    </Card.Section>
  );
}

function StageItemRow({
  tournament,
  stageItem,
  swrStagesResponse,
  availableInputs,
  rankings,
  swrAvailableInputsResponse,
}: {
  tournament: Tournament;
  stageItem: StageItemWithRounds;
  swrStagesResponse: SWRResponse;
  availableInputs: StageItemInputChoice[];
  rankings: Ranking[];
  swrAvailableInputsResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const inputs = stageItem.inputs
    .sort((i1, i2) => (i1.slot > i2.slot ? 1 : -1))
    .map((input, i) => {
      let currentOptionValue = null;
      if (input.team_id != null) {
        currentOptionValue = `${input.team_id}`;
      } else if (input.winner_from_stage_item_id != null) {
        currentOptionValue = `${input.winner_from_stage_item_id}_${input.winner_position}`;
      }

      return (
        <StageItemInputSectionLast
          key={i}
          tournament={tournament}
          stageItemInput={input}
          currentOptionValue={currentOptionValue}
          availableInputs={availableInputs}
          lastInList={i === stageItem.inputs.length - 1}
          swrAvailableInputsResponse={swrAvailableInputsResponse}
          swrStagesResponse={swrStagesResponse}
        />
      );
    });

  return (
    <Card withBorder shadow="sm" radius="md">
      <Card.Section withBorder inheritPadding py="xs" color="dimmed">
        <Group justify="space-between">
          <Text fw={800}>{stageItem.name}</Text>
          <UpdateStageItemModal
            swrStagesResponse={swrStagesResponse}
            stageItem={stageItem}
            tournament={tournament}
            opened={opened}
            setOpened={setOpened}
            rankings={rankings}
          />
          <Menu withinPortal position="bottom-end" shadow="sm">
            <Menu.Target>
              <ActionIcon variant="transparent" color="gray">
                <IconDots size="1.25rem" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconPencil size="1.5rem" />}
                onClick={() => {
                  setOpened(true);
                }}
              >
                {t('edit_stage_item_label')}
              </Menu.Item>
              {stageItem.type === 'SWISS' ? (
                <Menu.Item
                  leftSection={<BiSolidWrench size="1.5rem" />}
                  component={Link}
                  href={`/tournaments/${tournament.id}/swiss/${stageItem.id}`}
                >
                  {t('handle_swiss_system')}
                </Menu.Item>
              ) : null}
              <Menu.Item
                leftSection={<IconTrash size="1.5rem" />}
                onClick={async () => {
                  await deleteStageItem(tournament.id, stageItem.id);
                  await swrStagesResponse.mutate();
                  await swrAvailableInputsResponse.mutate();
                }}
                color="red"
              >
                {t('delete_button')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Card.Section>
      {inputs}
    </Card>
  );
}

function StageColumn({
  tournament,
  stage,
  swrStagesResponse,
  swrAvailableInputsResponse,
  rankings,
}: {
  tournament: Tournament;
  stage: StageWithStageItems;
  swrStagesResponse: SWRResponse;
  swrAvailableInputsResponse: SWRResponse;
  rankings: Ranking[];
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const teamsMap = getTeamsLookup(tournament != null ? tournament.id : -1);
  const stageItemsLookup = getStageItemLookup(swrStagesResponse);

  if (teamsMap == null) {
    return null;
  }

  const availableInputs =
    getAvailableInputs(swrAvailableInputsResponse, teamsMap, stageItemsLookup)[stage.id] || [];
  availableInputs.push({
    value: 'null',
    label: null,
    team_id: null,
    winner_from_stage_item_id: null,
    winner_position: null,
  });

  const rows = stage.stage_items
    .sort((i1: StageItemWithRounds, i2: StageItemWithRounds) => (i1.name > i2.name ? 1 : -1))
    .map((stageItem: StageItemWithRounds) => (
      <StageItemRow
        key={stageItem.id}
        tournament={tournament}
        stageItem={stageItem}
        swrStagesResponse={swrStagesResponse}
        availableInputs={availableInputs}
        swrAvailableInputsResponse={swrAvailableInputsResponse}
        rankings={rankings}
      />
    ));

  return (
    <Stack miw="24rem" align="top" key={stage.id}>
      <UpdateStageModal
        swrStagesResponse={swrStagesResponse}
        stage={stage}
        tournament={tournament}
        opened={opened}
        setOpened={setOpened}
      />
      <Group justify="space-between">
        <Group>
          {stage.name}
          {stage.is_active ? <Badge color="green">{t('active_badge_label')}</Badge> : null}
        </Group>
        <Menu withinPortal position="bottom-end" shadow="sm">
          <Menu.Target>
            <ActionIcon variant="transparent" color="gray">
              <IconDots size="1.25rem" />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconPencil size="1.5rem" />}
              onClick={() => {
                setOpened(true);
              }}
            >
              {t('edit_stage_label')}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconTrash size="1.5rem" />}
              onClick={async () => {
                await deleteStage(tournament.id, stage.id);
                await swrStagesResponse.mutate();
                await swrAvailableInputsResponse.mutate();
              }}
              color="red"
            >
              {t('delete_button')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      {rows}
      <CreateStageItemModal
        key={-1}
        tournament={tournament}
        stage={stage}
        swrStagesResponse={swrStagesResponse}
        swrAvailableInputsResponse={swrAvailableInputsResponse}
      />
    </Stack>
  );
}

export default function Builder({
  tournament,
  swrStagesResponse,
  swrAvailableInputsResponse,
  rankings,
}: {
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
  swrAvailableInputsResponse: SWRResponse;
  rankings: Ranking[];
}) {
  const stages: StageWithStageItems[] =
    swrStagesResponse.data != null ? swrStagesResponse.data.data : [];

  if (swrStagesResponse.error) return <RequestErrorAlert error={swrStagesResponse.error} />;
  if (swrAvailableInputsResponse.error) {
    return <RequestErrorAlert error={swrAvailableInputsResponse.error} />;
  }

  const cols = stages
    .sort((s1: StageWithStageItems, s2: StageWithStageItems) => (s1.id > s2.id ? 1 : -1))
    .map((stage) => (
      <StageColumn
        key={stage.id}
        tournament={tournament}
        swrStagesResponse={swrStagesResponse}
        swrAvailableInputsResponse={swrAvailableInputsResponse}
        stage={stage}
        rankings={rankings}
      />
    ));

  const button = (
    <Stack miw="24rem" align="top" key={-1}>
      <h4 style={{ marginTop: '0rem' }}>
        <CreateStageButton
          tournament={tournament}
          swrStagesResponse={swrStagesResponse}
          swrAvailableInputsResponse={swrAvailableInputsResponse}
        />
      </h4>
    </Stack>
  );
  return cols.concat([button]);
}
