import { ActionIcon, Button, Modal, TextInput, Title, UnstyledButton } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPencil } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { LuConstruction } from 'react-icons/lu';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { TournamentMinimal } from '../../interfaces/tournament';
import { deleteRound, updateRound } from '../../services/round';
import DeleteButton from '../buttons/delete';

function RoundDeleteButton({
  tournamentData,
  round,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
}: {
  tournamentData: TournamentMinimal;
  round: RoundInterface;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
}) {
  const { t } = useTranslation();
  return (
    <DeleteButton
      fullWidth
      onClick={async () => {
        await deleteRound(tournamentData.id, round.id);
        await swrStagesResponse.mutate();
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
  swrStagesResponse,
  swrUpcomingMatchesResponse,
}: {
  tournamentData: TournamentMinimal;
  round: RoundInterface;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: round == null ? '' : round.name,
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
            await updateRound(tournamentData.id, round.id, values.name, round.is_draft);
            await swrStagesResponse.mutate();
            setOpened(false);
          })}
        >
          <TextInput
            withAsterisk
            label={t('name_input_label')}
            placeholder={t('round_name_input_placeholder')}
            {...form.getInputProps('name')}
          />
          <Button fullWidth mt="1rem" color="green" type="submit">
            {t('save_button')}
          </Button>
        </form>
        <Button
          fullWidth
          mt="1rem"
          color="yellow"
          variant="outline"
          disabled={round.is_draft}
          leftSection={<LuConstruction />}
          onClick={async () => {
            await updateRound(tournamentData.id, round.id, round.name, true);
            await swrStagesResponse.mutate();
            if (swrUpcomingMatchesResponse != null) await swrUpcomingMatchesResponse.mutate();
            setOpened(false);
          }}
        >
          {t('mark_round_as_draft')}
        </Button>
        <RoundDeleteButton
          swrStagesResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          tournamentData={tournamentData}
          round={round}
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
