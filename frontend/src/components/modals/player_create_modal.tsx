import { Button, Checkbox, Modal, Tabs, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconUserPlus, IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation();
  const form = useForm({
    initialValues: {
      names: '',
      active: true,
    },

    validate: {
      names: (value) => (value.length > 0 ? null : t('at_least_one_player_validation')),
    },
  });
  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        await createMultiplePlayers(tournament_id, values.names, values.active);
        await swrPlayersResponse.mutate();
        setOpened(false);
      })}
    >
      <MultiPlayersInput form={form} />

      <Checkbox
        mt="md"
        label={t('active_players_checkbox_label')}
        {...form.getInputProps('active', { type: 'checkbox' })}
      />
      <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
        {t('save_players_button')}
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
  const { t } = useTranslation();
  const form = useForm({
    initialValues: {
      name: '',
      active: true,
      player_ids: [],
    },
    validate: {
      name: (value) => (value.length > 0 ? null : t('too_short_name_validation')),
    },
  });
  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        await createPlayer(tournament_id, values.name, values.active);
        await swrPlayersResponse.mutate();
        setOpened(false);
      })}
    >
      <TextInput
        withAsterisk
        label={t('name_input_label')}
        placeholder={t('player_name_input_placeholder')}
        {...form.getInputProps('name')}
      />

      <Checkbox
        mt="md"
        label={t('active_player_checkbox_label')}
        {...form.getInputProps('active', { type: 'checkbox' })}
      />

      <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
        {t('save_players_button')}
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
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('create_player_modal_title')}
      >
        <Tabs defaultValue="single">
          <Tabs.List justify="center" grow>
            <Tabs.Tab value="single" leftSection={<IconUser size="0.8rem" />}>
              {t('single_player_title')}
            </Tabs.Tab>
            <Tabs.Tab value="multi" leftSection={<IconUsers size="0.8rem" />}>
              {t('multiple_players_title')}
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

      <SaveButton
        onClick={() => setOpened(true)}
        leftSection={<IconUserPlus size={24} />}
        title={t('add_player_button')}
      />
    </>
  );
}
