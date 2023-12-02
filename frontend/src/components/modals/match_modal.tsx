import { Button, Center, Checkbox, Divider, Grid, Modal, NumberInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import {
  MatchBodyInterface,
  MatchInterface,
  formatMatchTeam1,
  formatMatchTeam2,
} from '../../interfaces/match';
import { TournamentMinimal } from '../../interfaces/tournament';
import { getMatchLookup, getStageItemLookup } from '../../services/lookups';
import { deleteMatch, updateMatch } from '../../services/match';
import DeleteButton from '../buttons/delete';

function MatchDeleteButton({
  tournamentData,
  match,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  dynamicSchedule,
}: {
  tournamentData: TournamentMinimal;
  match: MatchInterface;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  dynamicSchedule: boolean;
}) {
  if (!dynamicSchedule) return null;
  return (
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
  );
}

export default function MatchModal({
  tournamentData,
  match,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  opened,
  setOpened,
  dynamicSchedule,
}: {
  tournamentData: TournamentMinimal;
  match: MatchInterface;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  opened: boolean;
  setOpened: any;
  dynamicSchedule: boolean;
}) {
  const form = useForm({
    initialValues: {
      team1_score: match.team1_score,
      team2_score: match.team2_score,
      custom_duration_minutes: match.custom_duration_minutes,
      custom_margin_minutes: match.custom_margin_minutes,
    },

    validate: {
      team1_score: (value) => (value >= 0 ? null : 'Score cannot be negative'),
      team2_score: (value) => (value >= 0 ? null : 'Score cannot be negative'),
      custom_duration_minutes: (value) =>
        value == null || value >= 0 ? null : 'Match duration cannot be negative',
      custom_margin_minutes: (value) =>
        value == null || value >= 0 ? null : 'Match margin cannot be negative',
    },
  });

  const [customDurationEnabled, setCustomDurationEnabled] = useState(
    match.custom_duration_minutes != null
  );
  const [customMarginEnabled, setCustomMarginEnabled] = useState(
    match.custom_margin_minutes != null
  );

  const stageItemsLookup = getStageItemLookup(swrStagesResponse);
  const matchesLookup = getMatchLookup(swrStagesResponse);

  const team1Name = formatMatchTeam1(stageItemsLookup, matchesLookup, match);
  const team2Name = formatMatchTeam2(stageItemsLookup, matchesLookup, match);

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
              court_id: match.court_id,
              custom_duration_minutes: customDurationEnabled
                ? values.custom_duration_minutes
                : null,
              custom_margin_minutes: customMarginEnabled ? values.custom_margin_minutes : null,
            };
            await updateMatch(tournamentData.id, match.id, updatedMatch);
            await swrStagesResponse.mutate(null);
            if (swrUpcomingMatchesResponse != null) await swrUpcomingMatchesResponse.mutate(null);
            setOpened(false);
          })}
        >
          <NumberInput
            withAsterisk
            label={`Score of ${team1Name}`}
            placeholder={`Score of ${team1Name}`}
            {...form.getInputProps('team1_score')}
          />
          <NumberInput
            withAsterisk
            mt="lg"
            label={`Score of ${team2Name}`}
            placeholder={`Score of ${team2Name}`}
            {...form.getInputProps('team2_score')}
          />
          <Divider mt="lg" />

          <Text size="sm" mt="lg">
            Custom match duration
          </Text>
          <Grid align="center">
            <Grid.Col span={{ sm: 8 }}>
              <NumberInput
                disabled={!customDurationEnabled}
                rightSection={<Text>minutes</Text>}
                placeholder={`${match.duration_minutes}`}
                rightSectionWidth={92}
                {...form.getInputProps('custom_duration_minutes')}
              />
            </Grid.Col>
            <Grid.Col span={{ sm: 4 }}>
              <Center>
                <Checkbox
                  checked={customDurationEnabled}
                  label="Customize"
                  onChange={(event) => {
                    setCustomDurationEnabled(event.currentTarget.checked);
                  }}
                />
              </Center>
            </Grid.Col>
          </Grid>

          <Text size="sm" mt="lg">
            Custom match margin
          </Text>
          <Grid align="center">
            <Grid.Col span={{ sm: 8 }}>
              <NumberInput
                disabled={!customMarginEnabled}
                placeholder={`${match.margin_minutes}`}
                rightSection={<Text>minutes</Text>}
                rightSectionWidth={92}
                {...form.getInputProps('custom_margin_minutes')}
              />
            </Grid.Col>
            <Grid.Col span={{ sm: 4 }}>
              <Center>
                <Checkbox
                  checked={customMarginEnabled}
                  label="Customize"
                  onChange={(event) => {
                    setCustomMarginEnabled(event.currentTarget.checked);
                  }}
                />
              </Center>
            </Grid.Col>
          </Grid>

          <Button fullWidth style={{ marginTop: 20 }} color="green" type="submit">
            Save
          </Button>
        </form>
        <MatchDeleteButton
          swrRoundsResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          tournamentData={tournamentData}
          match={match}
          dynamicSchedule={dynamicSchedule}
        />
      </Modal>
    </>
  );
}
