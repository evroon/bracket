import { Button, Modal, NumberInput, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import React from 'react';
import { SWRResponse } from 'swr';

import { Court } from '../../interfaces/court';
import { MatchBodyInterface, MatchInterface } from '../../interfaces/match';
import { TournamentMinimal } from '../../interfaces/tournament';
import { deleteMatch, updateMatch } from '../../services/match';
import DeleteButton from '../buttons/delete';
import { responseIsValid } from '../utils/util';

function CourtsSelect({ form, swrCourtsResponse }: { form: any; swrCourtsResponse: SWRResponse }) {
  const data = responseIsValid(swrCourtsResponse)
    ? swrCourtsResponse.data.data.map((court: Court) => ({ value: court.id, label: court.name }))
    : [];
  return (
    <Select
      label="Court"
      placeholder="Pick a court"
      data={data}
      searchable
      maxDropdownHeight={400}
      style={{ marginTop: 20 }}
      nothingFound="No courts found"
      {...form.getInputProps('court_id')}
    />
  );
}

export default function MatchModal({
  tournamentData,
  match,
  swrRoundsResponse,
  swrCourtsResponse,
  swrUpcomingMatchesResponse,
  opened,
  setOpened,
}: {
  tournamentData: TournamentMinimal;
  match: MatchInterface;
  swrRoundsResponse: SWRResponse;
  swrCourtsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  opened: boolean;
  setOpened: any;
}) {
  const form = useForm({
    initialValues: {
      team1_score: match != null ? match.team1_score : 0,
      team2_score: match != null ? match.team2_score : 0,
      court_id: match != null ? match.court_id : null,
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
            const updatedMatch: MatchBodyInterface = {
              id: match.id,
              round_id: match.round_id,
              team1_score: values.team1_score,
              team2_score: values.team2_score,
              court_id: values.court_id,
            };
            await updateMatch(tournamentData.id, match.id, updatedMatch);
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

          <CourtsSelect form={form} swrCourtsResponse={swrCourtsResponse} />
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
          style={{ marginTop: '1rem' }}
          size="sm"
          title="Remove Match"
        />
      </Modal>
    </>
  );
}
