import {
  Button,
  Center,
  Checkbox,
  Fieldset,
  Image,
  Modal,
  MultiSelect,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { Player } from '../../interfaces/player';
import { TeamInterface } from '../../interfaces/team';
import {
  getBaseApiUrl,
  getPlayers,
  removeTeamLogo,
  requestSucceeded,
} from '../../services/adapter';
import { updateTeam } from '../../services/team';
import { DropzoneButton } from '../utils/file_upload';

function TeamLogo({ team }: { team: TeamInterface | null }) {
  if (team == null || team.logo_path == null) return null;
  return <Image radius="md" src={`${getBaseApiUrl()}/static/${team.logo_path}`} />;
}

export default function TeamUpdateModal({
  tournament_id,
  team,
  swrTeamsResponse,
}: {
  tournament_id: number;
  team: TeamInterface;
  swrTeamsResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const { data } = getPlayers(tournament_id, false);
  const players: Player[] = data != null ? data.data.players : [];
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: team.name,
      active: team.active,
      player_ids: team.players.map((player) => `${player.id}`),
    },

    validate: {
      name: (value) => (value.length > 0 ? null : t('too_short_name_validation')),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('edit_team_title')}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            const result = await updateTeam(
              tournament_id,
              team.id,
              values.name,
              values.active,
              values.player_ids
            );
            if (requestSucceeded(result)) {
              await swrTeamsResponse.mutate();
              setOpened(false);
            }
          })}
        >
          <TextInput
            withAsterisk
            label={t('name_input_label')}
            placeholder={t('team_name_input_placeholder')}
            {...form.getInputProps('name')}
          />

          <Checkbox
            mt="md"
            label={t('active_team_checkbox_label')}
            {...form.getInputProps('active', { type: 'checkbox' })}
          />

          <MultiSelect
            data={players.map((p) => ({ value: `${p.id}`, label: p.name }))}
            label={t('team_member_select_title')}
            placeholder={t('team_member_select_placeholder')}
            maxDropdownHeight={160}
            searchable
            mt={12}
            limit={25}
            {...form.getInputProps('player_ids')}
          />

          <Fieldset legend={t('logo_settings_title')} mt={12} radius="md">
            <DropzoneButton
              tournamentId={tournament_id}
              teamId={team.id}
              swrResponse={swrTeamsResponse}
              variant="team"
            />
            <Center my="lg">
              <div style={{ width: '50%' }}>
                <TeamLogo team={team} />
              </div>
            </Center>
            <Button
              variant="outline"
              color="red"
              fullWidth
              onClick={async () => {
                await removeTeamLogo(tournament_id, team.id);
                await swrTeamsResponse.mutate();
              }}
            >
              {t('remove_logo')}
            </Button>
          </Fieldset>

          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            {t('save_button')}
          </Button>
        </form>
      </Modal>

      <Button
        color="green"
        size="xs"
        style={{ marginRight: 10 }}
        onClick={() => setOpened(true)}
        leftSection={<BiEditAlt size={20} />}
      >
        {t('edit_team_title')}
      </Button>
    </>
  );
}
