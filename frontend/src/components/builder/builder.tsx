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
  StageItemInputChoice,
  StageItemInputOption,
  formatStageItemInput,
} from '../../interfaces/stage_item_input';
import { TeamInterface } from '../../interfaces/team';
import { Tournament } from '../../interfaces/tournament';
import { getAvailableStageItemInputs } from '../../services/adapter';
import { getStageItemLookup, getTeamsLookup } from '../../services/lookups';
import { deleteStage } from '../../services/stage';
import { deleteStageItem } from '../../services/stage_item';
import CreateStageButton from '../buttons/create_stage';
import { CreateStageItemModal } from '../modals/create_stage_item';
import { UpdateStageModal } from '../modals/update_stage';
import { UpdateStageItemModal } from '../modals/update_stage_item';
import RequestErrorAlert from '../utils/error_alert';
import { responseIsValid } from '../utils/util';

function StageItemInputComboBox({
  current_key,
  availableInputs,
}: {
  current_key: string | null;
  availableInputs: StageItemInputChoice[];
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState<string | null>(current_key);

  const options = availableInputs.map((option: StageItemInputChoice) => (
    <Combobox.Option value={option.value || 'nothing'}>{option.label}</Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        setValue(val);
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
          {value || <Input.Placeholder>Pick value</Input.Placeholder>}
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
  const getComboBoxOptionForStageItemInput = (stage_item_input: StageItemInputOption) => {
    if (stage_item_input.winner_from_stage_item_id == null) {
      if (stage_item_input.team_id == null) return null;
      const team = teamsMap[stage_item_input.team_id];
      if (team == null) return null;
      return {
        value: `${stage_item_input.team_id}`,
        label: team.name,
      };
    }

    assert(stage_item_input.winner_position != null);
    const stageItem = stageItemMap[stage_item_input.winner_from_stage_item_id];

    if (stageItem == null) return null;
    return {
      value: `${stage_item_input.winner_from_stage_item_id}_${stage_item_input.winner_position}`,
      label: `${formatStageItemInput(stage_item_input.winner_position, stageItem.name)}`,
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
  team,
  teamStageItem,
  lastInList,
  availableInputs,
}: {
  team: TeamInterface | null;
  teamStageItem: TeamInterface | null;
  lastInList: boolean;
  availableInputs: StageItemInputChoice[];
}) {
  assert(team != null || teamStageItem != null);

  const opts = lastInList ? { pt: 'xs', mb: '-0.5rem' } : { py: 'xs', withBorder: true };

  return (
    <Card.Section inheritPadding {...opts}>
      <StageItemInputComboBox current_key={team?.name || null} availableInputs={availableInputs} />
    </Card.Section>
  );
}

function StageItemRow({
  teamsMap,
  tournament,
  stageItem,
  swrStagesResponse,
  stageItemsLookup,
  availableInputs,
  rankings,
}: {
  teamsMap: any;
  tournament: Tournament;
  stageItem: StageItemWithRounds;
  stageItemsLookup: any;
  swrStagesResponse: SWRResponse;
  availableInputs: StageItemInputChoice[];
  rankings: Ranking[];
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const inputs = stageItem.inputs
    .sort((i1, i2) => (i1.slot > i2.slot ? 1 : -1))
    .map((input, i) => {
      const team = input.team_id ? teamsMap[input.team_id] : null;
      const teamStageItem = input.winner_from_stage_item_id
        ? stageItemsLookup[input.winner_from_stage_item_id]
        : null;

      return (
        <StageItemInputSectionLast
          key={i}
          team={team}
          availableInputs={availableInputs}
          teamStageItem={teamStageItem}
          lastInList={i === stageItem.inputs.length - 1}
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

  const availableInputs = getAvailableInputs(
    swrAvailableInputsResponse,
    teamsMap,
    stageItemsLookup
  )[stage.id];
  if (availableInputs == null) {
    return null;
  }

  const rows = stage.stage_items
    .sort((i1: StageItemWithRounds, i2: StageItemWithRounds) => (i1.name > i2.name ? 1 : -1))
    .map((stageItem: StageItemWithRounds) => (
      <StageItemRow
        key={stageItem.id}
        teamsMap={teamsMap}
        tournament={tournament}
        stageItem={stageItem}
        stageItemsLookup={stageItemsLookup}
        swrStagesResponse={swrStagesResponse}
        availableInputs={availableInputs}
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
      />
    </Stack>
  );
}

export default function Builder({
  tournament,
  swrStagesResponse,
  rankings,
}: {
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
  rankings: Ranking[];
}) {
  const stages: StageWithStageItems[] =
    swrStagesResponse.data != null ? swrStagesResponse.data.data : [];
  const swrAvailableInputsResponse = getAvailableStageItemInputs(tournament.id);

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
        <CreateStageButton tournament={tournament} swrStagesResponse={swrStagesResponse} />
      </h4>
    </Stack>
  );
  return cols.concat([button]);
}
