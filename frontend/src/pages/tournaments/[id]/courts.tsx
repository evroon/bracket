import { Button, Container, Divider, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { SWRResponse } from 'swr';

import CourtsTable from '../../../components/tables/courts';
import { getTournamentIdFromRouter } from '../../../components/utils/util';
import { Tournament } from '../../../interfaces/tournament';
import { getCourts, getTournaments } from '../../../services/adapter';
import { createCourt } from '../../../services/court';
import TournamentLayout from '../_tournament_layout';

function CreateCourtForm(tournament: Tournament, swrCourtsResponse: SWRResponse) {
  const form = useForm({
    initialValues: { name: '' },
    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        await createCourt(tournament.id, values.name);
        await swrCourtsResponse.mutate(null);
      })}
    >
      <Divider mt={12} />
      <h3>Add Court</h3>
      <TextInput
        withAsterisk
        label="Name"
        placeholder="Best Court Ever"
        {...form.getInputProps('name')}
      />
      <Button fullWidth style={{ marginTop: 16 }} color="green" type="submit">
        Create Court
      </Button>
    </form>
  );
}

export default function CourtsPage() {
  const { tournamentData } = getTournamentIdFromRouter();
  const swrCourtsResponse = getCourts(tournamentData.id);

  const swrTournamentsResponse = getTournaments();
  const tournaments: Tournament[] =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : [];
  const tournamentDataFull = tournaments.filter(
    (tournament) => tournament.id === tournamentData.id
  )[0];

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Container>
        <CourtsTable tournament={tournamentDataFull} swrCourtsResponse={swrCourtsResponse} />
        {CreateCourtForm(tournamentDataFull, swrCourtsResponse)}
      </Container>
    </TournamentLayout>
  );
}
