import { Button, Checkbox, Group, Modal, Tabs, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconUserPlus, IconUsers } from '@tabler/icons-react';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { createMultiplePlayers, createPlayer } from '../../services/player';
import SaveButton from '../buttons/save';
import { MultiPlayersInput } from '../forms/player_create_csv_input';

export default function PlayerCreateModal({
  tournament_id,
  player,
  swrPlayersResponse,
}: {
  tournament_id: number;
  player: Player | null;
  swrPlayersResponse: SWRResponse;
}) {
  const [opened, setOpened] = useState(false);
  const modalOpenButton = (
    <Group position="right">
      <SaveButton
        onClick={() => setOpened(true)}
        leftIcon={<IconUserPlus size={24} />}
        title="Add Player"
      />
    </Group>
  );

  const form = useForm({
    initialValues: {
      name: player == null ? '' : player.name,
      names: '',
      active: player == null ? true : player.active,
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Add Player">
        <form
          onSubmit={form.onSubmit(async (values) => {
            if (values.names !== '') {
              await createMultiplePlayers(tournament_id, values.names, values.active, null);
            } else {
              await createPlayer(tournament_id, values.name, values.active, null);
            }
            await swrPlayersResponse.mutate(null);
            setOpened(false);
          })}
        >
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
              <TextInput
                withAsterisk
                label="Name"
                placeholder="Best Player Ever"
                {...form.getInputProps('name')}
              />
            </Tabs.Panel>

            <Tabs.Panel value="multi" pt="xs">
              <MultiPlayersInput form={form} />
            </Tabs.Panel>
          </Tabs>

          <Checkbox
            mt="md"
            label="This player is active"
            {...form.getInputProps('active', { type: 'checkbox' })}
          />

          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            Save
          </Button>
        </form>
      </Modal>

      {modalOpenButton}
    </>
  );
}
