import { Button, Checkbox, Group, Modal, MultiSelect, Tabs, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconUsers, IconUsersPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { getPlayers } from '../../services/adapter';
import { createTeam, createTeams } from '../../services/team';
import SaveButton from '../buttons/save';
import { MultiTeamsInput } from '../forms/player_create_csv_input';

function MultiTeamTab({
  tournament_id,
  swrTeamsResponse,
  setOpened,
}: {
  tournament_id: number;
  swrTeamsResponse: SWRResponse;
  setOpened: any;
}) {
  const form = useForm({
    initialValues: {
      names: '',
      active: true,
    },

    validate: {
      names: (value) => (value.length > 0 ? null : 'Enter at least one team'),
    },
  });
  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        await createTeams(tournament_id, values.names, values.active);
        await swrTeamsResponse.mutate(null);
        setOpened(false);
      })}
    >
      <MultiTeamsInput form={form} />

      <Checkbox
        mt="md"
        label="These teams are active"
        {...form.getInputProps('active', { type: 'checkbox' })}
      />
      <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
        Save
      </Button>
    </form>
  );
}

function SingleTeamTab({
  tournament_id,
  swrTeamsResponse,
  setOpened,
}: {
  tournament_id: number;
  swrTeamsResponse: SWRResponse;
  setOpened: any;
}) {
  const { data } = getPlayers(tournament_id, false);
  const players: Player[] = data != null ? data.data : [];
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
        await createTeam(tournament_id, values.name, values.active, values.player_ids);
        await swrTeamsResponse.mutate(null);
        setOpened(false);
      })}
    >
      <TextInput
        withAsterisk
        label="Name"
        placeholder="Best Team Ever"
        {...form.getInputProps('name')}
      />

      <Checkbox
        mt="md"
        label="This team is active"
        {...form.getInputProps('active', { type: 'checkbox' })}
      />

      <MultiSelect
        data={players.map((p) => ({ value: `${p.id}`, label: p.name }))}
        label="Team members"
        placeholder="Pick all that you like"
        dropdownPosition="bottom"
        maxDropdownHeight={160}
        searchable
        mb="12rem"
        mt={12}
        limit={25}
        {...form.getInputProps('player_ids')}
      />
      <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
        Save
      </Button>
    </form>
  );
}

export default function TeamCreateModal({
  tournament_id,
  swrTeamsResponse,
}: {
  tournament_id: number;
  swrTeamsResponse: SWRResponse;
}) {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Create Team">
        <Tabs defaultValue="single">
          <Tabs.List position="center" grow>
            <Tabs.Tab value="single" icon={<IconUser size="0.8rem" />}>
              Single team
            </Tabs.Tab>
            <Tabs.Tab value="multi" icon={<IconUsers size="0.8rem" />}>
              Multiple teams
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="single" pt="xs">
            <SingleTeamTab
              swrTeamsResponse={swrTeamsResponse}
              tournament_id={tournament_id}
              setOpened={setOpened}
            />
          </Tabs.Panel>

          <Tabs.Panel value="multi" pt="xs">
            <MultiTeamTab
              swrTeamsResponse={swrTeamsResponse}
              tournament_id={tournament_id}
              setOpened={setOpened}
            />
          </Tabs.Panel>
        </Tabs>
      </Modal>

      <Group position="right">
        <SaveButton
          onClick={() => setOpened(true)}
          leftIcon={<IconUsersPlus size={24} />}
          title="Add Team"
          mt="1.5rem"
        />
      </Group>
    </>
  );
}
