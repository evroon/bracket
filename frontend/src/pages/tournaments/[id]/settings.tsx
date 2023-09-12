import { Button, Checkbox, Container, CopyButton, Image, Select, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import assert from 'assert';
import { SWRResponse } from 'swr';

import { DropzoneButton } from '../../../components/utils/file_upload';
import { getBaseURL, getTournamentIdFromRouter } from '../../../components/utils/util';
import { Club } from '../../../interfaces/club';
import { Tournament } from '../../../interfaces/tournament';
import { getBaseApiUrl, getClubs, getTournaments } from '../../../services/adapter';
import { createTournament, updateTournament } from '../../../services/tournament';
import TournamentLayout from '../_tournament_layout';

export function TournamentLogo({ tournament }: { tournament: Tournament | null }) {
  if (tournament == null || tournament.logo_path == null) return null;
  return <Image radius="md" src={`${getBaseApiUrl()}/static/${tournament.logo_path}`} />;
}

function GeneralTournamentForm({
  is_create_form,
  tournament,
  swrTournamentsResponse,
  clubs,
}: {
  is_create_form: boolean;
  tournament: Tournament | null;
  swrTournamentsResponse: SWRResponse;
  clubs: Club[];
}) {
  const form = useForm({
    initialValues: {
      name: tournament == null ? '' : tournament.name,
      club_id: tournament == null ? null : `${tournament.club_id}`,
      dashboard_public: tournament == null ? true : tournament.dashboard_public,
      players_can_be_in_multiple_teams:
        tournament == null ? true : tournament.players_can_be_in_multiple_teams,
      auto_assign_courts: tournament == null ? true : tournament.auto_assign_courts,
    },

    validate: {
      name: (value) => (value.length > 0 ? null : 'Name too short'),
      club_id: (value) => (value != null ? null : 'Please choose a club'),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        assert(values.club_id != null);
        if (is_create_form) {
          await createTournament(
            parseInt(values.club_id, 10),
            values.name,
            values.dashboard_public,
            values.players_can_be_in_multiple_teams,
            values.auto_assign_courts
          );
        } else {
          assert(tournament != null);
          await updateTournament(
            tournament.id,
            values.name,
            values.dashboard_public,
            values.players_can_be_in_multiple_teams,
            values.auto_assign_courts
          );
        }
        await swrTournamentsResponse.mutate(null);
      })}
    >
      <TextInput
        withAsterisk
        label="Name"
        placeholder="Best Tournament Ever"
        {...form.getInputProps('name')}
      />

      <Select
        data={clubs.map((p) => ({ value: `${p.id}`, label: p.name }))}
        label="Club"
        placeholder="Pick a club for this tournament"
        searchable
        limit={20}
        style={{ marginTop: 10 }}
        {...form.getInputProps('club_id')}
      />
      <Checkbox
        mt="md"
        label="Allow anyone to see the dashboard of rounds and matches"
        {...form.getInputProps('dashboard_public', { type: 'checkbox' })}
      />
      <Checkbox
        mt="md"
        label="Allow players to be in multiple teams"
        {...form.getInputProps('players_can_be_in_multiple_teams', { type: 'checkbox' })}
      />
      <Checkbox
        mt="md"
        label="Automatically assign courts to matches"
        {...form.getInputProps('auto_assign_courts', { type: 'checkbox' })}
      />

      {tournament != null ? <DropzoneButton tournament={tournament} /> : null}

      <TournamentLogo tournament={tournament} />
      <Button fullWidth mt={8} color="green" type="submit">
        Save
      </Button>

      {tournament != null ? (
        <CopyButton value={`${getBaseURL()}/tournaments/${tournament.id}/dashboard`}>
          {({ copied, copy }) => (
            <Button fullWidth mt={8} color={copied ? 'teal' : 'blue'} onClick={copy}>
              {copied ? 'Copied dashboard URL' : 'Copy dashboard URL'}
            </Button>
          )}
        </CopyButton>
      ) : null}
    </form>
  );
}

export default function SettingsPage() {
  const { tournamentData } = getTournamentIdFromRouter();

  const swrTournamentsResponse = getTournaments();
  const tournaments: Tournament[] =
    swrTournamentsResponse.data != null ? swrTournamentsResponse.data.data : [];
  const tournamentDataFull = tournaments.filter(
    (tournament) => tournament.id === tournamentData.id
  )[0];

  const is_create_form = tournamentDataFull == null;
  const swrClubsResponse: SWRResponse = getClubs();
  const clubs: Club[] = swrClubsResponse.data != null ? swrClubsResponse.data.data : [];

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Container>
        <GeneralTournamentForm
          is_create_form={is_create_form}
          tournament={tournamentDataFull}
          swrTournamentsResponse={swrTournamentsResponse}
          clubs={clubs}
        />
      </Container>
    </TournamentLayout>
  );
}
