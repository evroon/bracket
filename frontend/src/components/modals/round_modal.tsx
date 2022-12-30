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
import { IconPencil } from '@tabler/icons';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { RoundInterface } from '../../interfaces/round';
import { Tournament } from '../../interfaces/tournament';
import { deleteRound, updateRound } from '../../services/round';
import DeleteButton from '../buttons/delete';

export default function RoundModal({
  tournamentData,
  round,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
}: {
  tournamentData: Tournament;
  round: RoundInterface;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
}) {
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: round == null ? '' : round.name,
      is_active: round == null ? true : round.is_active,
      is_draft: round == null ? true : round.is_draft,
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Edit Round">
        <form
          onSubmit={form.onSubmit(async (values) => {
            await updateRound(tournamentData.id, round.id, values as RoundInterface);
            await swrRoundsResponse.mutate(null);
            setOpened(false);
          })}
        >
          <TextInput
            withAsterisk
            label="Name"
            placeholder="Best Round Ever"
            {...form.getInputProps('name')}
          />
          <Checkbox
            mt="md"
            label="This round is active"
            {...form.getInputProps('is_active', { type: 'checkbox' })}
          />
          <Checkbox
            mt="md"
            label="This round is a draft round"
            {...form.getInputProps('is_draft', { type: 'checkbox' })}
          />
          <Button fullWidth style={{ marginTop: 20 }} color="green" type="submit">
            Save
          </Button>
        </form>
        <DeleteButton
          fullWidth
          onClick={async () => {
            await deleteRound(tournamentData.id, round.id);
            await swrRoundsResponse.mutate(null);
            await swrUpcomingMatchesResponse.mutate(null);
          }}
          style={{ marginTop: '15px' }}
          size="sm"
          title="Delete Round"
        />
      </Modal>

      <UnstyledButton onClick={() => setOpened(true)}>
        <Title order={3}>{round.name}</Title>
      </UnstyledButton>
      <ActionIcon onClick={() => setOpened(true)}>
        <IconPencil size={18} style={{ marginBottom: '5px' }} />
      </ActionIcon>
    </>
  );
}
