import { Button, Modal, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import React from 'react';
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
      team1_score: match != null ? match.team1_score : 0,
      team2_score: match != null ? match.team2_score : 0,
    },

    validate: {
      team1_score: (value) => (value >= 0 ? null : 'Score cannot be negative'),
      team2_score: (value) => (value >= 0 ? null : 'Score cannot be negative'),
    },
  });

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
            style={{ marginTop: 20 }}
            label={`Score of ${team2Name}`}
            placeholder={`Score of ${team2Name}`}
            {...form.getInputProps('team2_score')}
          />

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
