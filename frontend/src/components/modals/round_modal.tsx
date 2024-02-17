import {
  ActionIcon,
  Button,
  Checkbox,
  Modal,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPencil } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import { deleteRound, updateRound } from '../../services/round';
import DeleteButton from '../buttons/delete';

function RoundDeleteButton({
  tournamentData,
  round,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  dynamicSchedule,
}: {
  tournamentData: TournamentMinimal;
  round: RoundInterface;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  dynamicSchedule: boolean;
}) {
  const { t } = useTranslation();
  if (!dynamicSchedule) return null;
  return (
    <DeleteButton
      fullWidth
      onClick={async () => {
        await deleteRound(tournamentData.id, round.id);
        await swrRoundsResponse.mutate();
        if (swrUpcomingMatchesResponse != null) await swrUpcomingMatchesResponse.mutate();
      }}
      style={{ marginTop: '15px' }}
      size="sm"
      title={t('delete_round_button')}
    />
  );
}

export default function RoundModal({
  tournamentData,
  round,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  dynamicSchedule,
}: {
  tournamentData: TournamentMinimal;
  round: RoundInterface;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  dynamicSchedule: boolean;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: round == null ? '' : round.name,
      is_active: round == null ? true : round.is_active,
      is_draft: round == null ? true : round.is_draft,
    },

    validate: {
      name: (value) => (value.length > 0 ? null : t('too_short_name_validation')),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('edit_round')}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            await updateRound(tournamentData.id, round.id, values as RoundInterface);
            await swrRoundsResponse.mutate();
            setOpened(false);
          })}
        >
          <TextInput
            withAsterisk
            label={t('name_input_label')}
            placeholder={t('round_name_input_placeholder')}
            {...form.getInputProps('name')}
          />
          <Checkbox
            mt="md"
            label={t('active_round_checkbox_label')}
            {...form.getInputProps('is_active', { type: 'checkbox' })}
          />
          <Checkbox
            mt="md"
            label={t('draft_round_checkbox_label')}
            {...form.getInputProps('is_draft', { type: 'checkbox' })}
          />
          <Button fullWidth style={{ marginTop: 20 }} color="green" type="submit">
            {t('save_button')}
          </Button>
        </form>
        <RoundDeleteButton
          swrRoundsResponse={swrRoundsResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          tournamentData={tournamentData}
          round={round}
          dynamicSchedule={dynamicSchedule}
        />
      </Modal>

      <UnstyledButton onClick={() => setOpened(true)}>
        <Title order={3}>{round.name}</Title>
      </UnstyledButton>
      <ActionIcon
        variant="subtle"
        ml="0.5rem"
        mb="0.25rem"
        color="gray"
        onClick={() => setOpened(true)}
      >
        <IconPencil size={18} style={{ marginBottom: '5px' }} />
      </ActionIcon>
    </>
  );
}
