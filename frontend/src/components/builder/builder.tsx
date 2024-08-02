import { ActionIcon, Badge, Card, Group, Menu, Stack, Text } from '@mantine/core';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import assert from 'assert';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React, { useState } from 'react';
import { BiSolidWrench } from 'react-icons/bi';
import { SWRResponse } from 'swr';

import { StageWithStageItems } from '../../interfaces/stage';
import { StageItemWithRounds } from '../../interfaces/stage_item';
import { StageItemInput, formatStageItemInput } from '../../interfaces/stage_item_input';
import { TeamInterface } from '../../interfaces/team';
import { Tournament } from '../../interfaces/tournament';
import { getStageItemLookup, getTeamsLookup } from '../../services/lookups';
import { deleteStage } from '../../services/stage';
import { deleteStageItem } from '../../services/stage_item';
import CreateStageButton from '../buttons/create_stage';
import { CreateStageItemModal } from '../modals/create_stage_item';
import { UpdateStageModal } from '../modals/update_stage';
import { UpdateStageItemModal } from '../modals/update_stage_item';
import RequestErrorAlert from '../utils/error_alert';

function StageItemInputSectionLast({
  input,
  team,
  teamStageItem,
  lastInList,
}: {
  input: StageItemInput;
  team: TeamInterface;
  teamStageItem: StageItemWithRounds;
  lastInList: boolean;
}) {
  const content = team
    ? team.name
    : // @ts-ignore
      formatStageItemInput(input.winner_position, teamStageItem.name);
  const opts = lastInList ? { pt: 'xs', mb: '-0.5rem' } : { py: 'xs', withBorder: true };

  return (
    <Card.Section inheritPadding {...opts}>
      <Text fw={500}>{content}</Text>
    </Card.Section>
  );
}

function StageItemRow({
  teamsMap,
  tournament,
  stageItem,
  swrStagesResponse,
}: {
  teamsMap: NonNullable<ReturnType<typeof getTeamsLookup>>;
  tournament: Tournament;
  stageItem: StageItemWithRounds;
  swrStagesResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const stageItemsLookup = getStageItemLookup(swrStagesResponse);

  const inputs = stageItem.inputs
    .sort((i1, i2) => (i1.slot > i2.slot ? 1 : -1))
    .map((input, i) => {
      const team = input.team_id ? teamsMap[input.team_id] : null;
      const teamStageItem = input.winner_from_stage_item_id
        ? stageItemsLookup[input.winner_from_stage_item_id]
        : null;

      assert(team != null || teamStageItem != null);

      return (
        <StageItemInputSectionLast
          key={i}
          team={team!}
          input={input}
          teamStageItem={teamStageItem!}
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
          />
          <Menu withinPortal position="bottom-end" shadow="sm">
            <Menu.Target>
              <ActionIcon variant="transparent" color="gray">
                <IconDots size="1.5rem" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconPencil size="1.5rem" />}
                onClick={() => {
                  setOpened(true);
                }}
              >
                {t('edit_name_button')}
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
}: {
  tournament: Tournament;
  stage: StageWithStageItems;
  swrStagesResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const teamsMap = getTeamsLookup(tournament != null ? tournament.id : -1);

  if (teamsMap == null) {
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
        swrStagesResponse={swrStagesResponse}
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
        <h4 style={{ marginBottom: '0rem' }}>
          {stage.name}
          {stage.is_active ? (
            <Badge ml="1rem" color="green">
              {t('active_badge_label')}
            </Badge>
          ) : null}
        </h4>
        <Menu withinPortal position="bottom-end" shadow="sm">
          <Menu.Target>
            <ActionIcon variant="transparent" color="gray">
              <IconDots size="1rem" />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconPencil size="1.5rem" />}
              onClick={() => {
                setOpened(true);
              }}
            >
              {t('edit_name_button')}
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
}: {
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
}) {
  const stages: StageWithStageItems[] =
    swrStagesResponse.data != null ? swrStagesResponse.data.data : [];

  if (swrStagesResponse.error) return <RequestErrorAlert error={swrStagesResponse.error} />;

  const cols = stages
    .sort((s1: StageWithStageItems, s2: StageWithStageItems) => (s1.id > s2.id ? 1 : -1))
    .map((stage) => (
      <StageColumn
        key={stage.id}
        tournament={tournament}
        swrStagesResponse={swrStagesResponse}
        stage={stage}
      />
    ));

  const button = (
    <Stack miw="24rem" align="top" key={-1}>
      <h4>
        <CreateStageButton tournament={tournament} swrStagesResponse={swrStagesResponse} />
      </h4>
    </Stack>
  );
  return cols.concat([button]);
}
