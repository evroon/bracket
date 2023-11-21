import { Button, Checkbox, Group, Modal, MultiSelect, Tabs, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconUsers, IconUsersPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { TeamInterface } from '../../interfaces/team';
import { getPlayers } from '../../services/adapter';
import { createTeam } from '../../services/team';
import SaveButton from '../buttons/save';
import { MultiTeamsInput } from '../forms/player_create_csv_input';

export default function TeamCreateModal({
  tournament_id,
  team,
  swrTeamsResponse,
}: {
  tournament_id: number;
  team: TeamInterface | null;
  swrTeamsResponse: SWRResponse;
}) {
  const { data } = getPlayers(tournament_id, false);
  const players: Player[] = data != null ? data.data : [];

  const [opened, setOpened] = useState(false);
  const modalOpenButton = (
    <Group position="right">
      <SaveButton
        onClick={() => setOpened(true)}
        leftIcon={<IconUsersPlus size={24} />}
        title="Add Team"
        style={{ marginTop: '1rem' }}
      />
    </Group>
  );

  const form = useForm({
    initialValues: {
      name: team == null ? '' : team.name,
      active: team == null ? true : team.active,
      player_ids: team == null ? [] : team.players.map((player) => `${player.id}`),
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Create Team">
        <form
          onSubmit={form.onSubmit(async (values) => {
            await createTeam(tournament_id, values.name, values.active, values.player_ids);
            await swrTeamsResponse.mutate(null);
            setOpened(false);
          })}
        >
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
            </Tabs.Panel>

            <Tabs.Panel value="multi" pt="xs">
              <MultiTeamsInput form={form} />

              <Checkbox
                mt="md"
                label="These teams are active"
                {...form.getInputProps('active', { type: 'checkbox' })}
              />
            </Tabs.Panel>
          </Tabs>

          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            Save
          </Button>
        </form>
      </Modal>

      {modalOpenButton}
    </>
  );
}
