import { Button, Checkbox, Group, Modal, Tabs, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconUserPlus, IconUsers } from '@tabler/icons-react';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { createMultiplePlayers, createPlayer } from '../../services/player';
import SaveButton from '../buttons/save';
import { MultiPlayersInput } from '../forms/player_create_csv_input';

function MultiPlayerTab({
  tournament_id,
  swrPlayersResponse,
  setOpened,
}: {
  tournament_id: number;
  swrPlayersResponse: SWRResponse;
  setOpened: any;
}) {
  const form = useForm({
    initialValues: {
      names: '',
      active: true,
    },

    validate: {
      names: (value) => (value.length > 0 ? null : 'Enter at least one player'),
    },
  });
  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        await createMultiplePlayers(tournament_id, values.names, values.active);
        await swrPlayersResponse.mutate(null);
        setOpened(false);
      })}
    >
      <MultiPlayersInput form={form} />

      <Checkbox
        mt="md"
        label="These players are active"
        {...form.getInputProps('active', { type: 'checkbox' })}
      />
      <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
        Save players
      </Button>
    </form>
  );
}

function SinglePlayerTab({
  tournament_id,
  swrPlayersResponse,
  setOpened,
}: {
  tournament_id: number;
  swrPlayersResponse: SWRResponse;
  setOpened: any;
}) {
  const form = useForm({
    initialValues: {
      name: '',
      active: true,
      player_ids: [],
    },
    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
    },
  });
  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        await createPlayer(tournament_id, values.name, values.active);
        await swrPlayersResponse.mutate(null);
        setOpened(false);
      })}
    >
      <TextInput
        withAsterisk
        label="Name"
        placeholder="Best Player Ever"
        {...form.getInputProps('name')}
      />

      <Checkbox
        mt="md"
        label="This player is active"
        {...form.getInputProps('active', { type: 'checkbox' })}
      />

      <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
        Save player
      </Button>
    </form>
  );
}

export default function PlayerCreateModal({
  tournament_id,
  swrPlayersResponse,
}: {
  tournament_id: number;
  swrPlayersResponse: SWRResponse;
}) {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Create Player">
        <Tabs defaultValue="single">
          <Tabs.List position="center" grow>
            <Tabs.Tab value="single" icon={<IconUser size="0.8rem" />}>
              Single player
            </Tabs.Tab>
            <Tabs.Tab value="multi" icon={<IconUsers size="0.8rem" />}>
              Multiple players
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="single" pt="xs">
            <SinglePlayerTab
              swrPlayersResponse={swrPlayersResponse}
              tournament_id={tournament_id}
              setOpened={setOpened}
            />
          </Tabs.Panel>

          <Tabs.Panel value="multi" pt="xs">
            <MultiPlayerTab
              swrPlayersResponse={swrPlayersResponse}
              tournament_id={tournament_id}
              setOpened={setOpened}
            />
          </Tabs.Panel>
        </Tabs>
      </Modal>

      <Group position="right">
        <SaveButton
          onClick={() => setOpened(true)}
          leftIcon={<IconUserPlus size={24} />}
          title="Add Player"
          mt="1.5rem"
        />
      </Group>
    </>
  );
}
