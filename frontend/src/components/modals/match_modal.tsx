import { Button, Modal, NumberInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import React from 'react';
import { SWRResponse } from 'swr';

import { MatchBodyInterface, MatchInterface } from '../../interfaces/match';
import { TournamentMinimal } from '../../interfaces/tournament';
import { deleteMatch, updateMatch } from '../../services/match';
import DeleteButton from '../buttons/delete';

export default function MatchModal({
  tournamentData,
  match,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  opened,
  setOpened,
}: {
  tournamentData: TournamentMinimal;
  match: MatchInterface;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  opened: boolean;
  setOpened: any;
}) {
  const form = useForm({
    initialValues: {
      team1_score: match != null ? match.team1_score : 0,
      team2_score: match != null ? match.team2_score : 0,
      label: match != null ? match.label : '',
    },

    validate: {
      team1_score: (value) => (value >= 0 ? null : 'Score cannot be negative'),
      team2_score: (value) => (value >= 0 ? null : 'Score cannot be negative'),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Edit Match">
        <form
          onSubmit={form.onSubmit(async (values) => {
            const newMatch: MatchBodyInterface = {
              id: match.id,
              round_id: match.round_id,
              team1_score: values.team1_score,
              team2_score: values.team2_score,
              label: values.label,
            };
            await updateMatch(tournamentData.id, match.id, newMatch);
            await swrRoundsResponse.mutate(null);
            if (swrUpcomingMatchesResponse != null) await swrUpcomingMatchesResponse.mutate(null);
            setOpened(false);
          })}
        >
          <NumberInput
            withAsterisk
            label={`Score of ${match.team1.name}`}
            placeholder={`Score of ${match.team1.name}`}
            {...form.getInputProps('team1_score')}
          />
          <NumberInput
            withAsterisk
            style={{ marginTop: 20 }}
            label={`Score of ${match.team2.name}`}
            placeholder={`Score of ${match.team2.name}`}
            {...form.getInputProps('team2_score')}
          />
          <TextInput
            withAsterisk
            style={{ marginTop: 20 }}
            label="Label for this match"
            placeholder="Court 1 | 11:30 - 12:00"
            {...form.getInputProps('label')}
          />
          <Button fullWidth style={{ marginTop: 20 }} color="green" type="submit">
            Save
          </Button>
        </form>
        <DeleteButton
          fullWidth
          onClick={async () => {
            await deleteMatch(tournamentData.id, match.id);
            await swrRoundsResponse.mutate(null);
            if (swrUpcomingMatchesResponse != null) await swrUpcomingMatchesResponse.mutate(null);
          }}
          style={{ marginTop: '15px' }}
          size="sm"
          title="Remove Match"
        />
      </Modal>
    </>
  );
}
