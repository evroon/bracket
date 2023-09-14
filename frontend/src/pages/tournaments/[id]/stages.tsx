import { Button, Container, Divider, Group, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import React from 'react';
import { SWRResponse } from 'swr';

import {
  NextStageButton,
  PreviousStageButton,
} from '../../../components/buttons/next_stage_button';
import StagesTable from '../../../components/tables/stages';
import { getTournamentIdFromRouter } from '../../../components/utils/util';
import { Tournament } from '../../../interfaces/tournament';
import { getStages, getTournaments } from '../../../services/adapter';
import { createStage } from '../../../services/stage';
import TournamentLayout from '../_tournament_layout';

function CreateStageForm(tournament: Tournament, swrClubsResponse: SWRResponse) {
  const form = useForm({
    initialValues: { type: 'ROUND_ROBIN' },
    validate: {},
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        await createStage(tournament.id, values.type);
        await swrClubsResponse.mutate(null);
      })}
    >
      <Divider mt={12} />
      <h3>Add Stage</h3>
      <Select
        label="Stage Type"
        data={[
          { value: 'ROUND_ROBIN', label: 'Round Robin' },
          { value: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
          { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
          { value: 'SWISS', label: 'Swiss' },
        ]}
        {...form.getInputProps('type')}
      />
      <Button fullWidth style={{ marginTop: 16 }} color="green" type="submit">
        Create Stage
      </Button>
    </form>
  );
}

export default function StagesPage() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrStagesResponse = getStages(tournamentData.id);

  const swrTournamentsResponse = getTournaments();
  const tournaments: Tournament[] =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : [];
  const tournamentDataFull = tournaments.filter(
    (tournament) => tournament.id === tournamentData.id
  )[0];

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Container>
        <StagesTable tournament={tournamentDataFull} swrStagesResponse={swrStagesResponse} />
        {CreateStageForm(tournamentDataFull, swrStagesResponse)}
        <Group grow mt="1rem">
          <PreviousStageButton
            tournamentData={tournamentData}
            swrStagesResponse={swrStagesResponse}
          />
          <NextStageButton tournamentData={tournamentData} swrStagesResponse={swrStagesResponse} />
        </Group>
      </Container>
    </TournamentLayout>
  );
}
