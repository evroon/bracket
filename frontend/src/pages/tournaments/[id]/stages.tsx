import { Container, Group } from '@mantine/core';
import React from 'react';

import Builder from '../../../components/builder/builder';
import {
  NextStageButton,
  PreviousStageButton,
} from '../../../components/buttons/next_stage_button';
import { getTournamentIdFromRouter } from '../../../components/utils/util';
import { Tournament } from '../../../interfaces/tournament';
import { getStages, getTournaments } from '../../../services/adapter';
import TournamentLayout from '../_tournament_layout';

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
      <Container size="1600px">
        <Builder tournament={tournamentDataFull} swrStagesResponse={swrStagesResponse} />
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
