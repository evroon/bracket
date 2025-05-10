import { Button, Checkbox, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { updatePlayer } from '../../services/player';

export default function PlayerUpdateModal({
  tournament_id,
  player,
  swrPlayersResponse,
}: {
  tournament_id: number;
  player: Player;
  swrPlayersResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const modalOpenButton = (
    <Button
      color="green"
      size="xs"
      style={{ marginRight: 10 }}
      onClick={() => setOpened(true)}
      leftSection={<BiEditAlt size={20} />}
    >
      {t('edit_player')}
    </Button>
  );

  const form = useForm({
    initialValues: {
      name: player == null ? '' : player.name,
      active: player == null ? true : player.active,
      elo_score: player == null ? 1200 : player.elo_score
    },
    validate: {
      name: (value) => (value.length > 0 ? null : t('too_short_name_validation')),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('edit_player')}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            await updatePlayer(tournament_id, player.id, values.name, values.active, null, values.elo_score);
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
          <TextInput
            label={t('edit_elo_score_label')}
            placeholder={t('player_elo_score_input_placeholder')}
            {...form.getInputProps('elo_score')}
          />

          <Checkbox
            mt="md"
            label={t('active_player_checkbox_label')}
            {...form.getInputProps('active', { type: 'checkbox' })}
          />

          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            {t('save_button')}
          </Button>
        </form>
      </Modal>

      {modalOpenButton}
    </>
  );
}
