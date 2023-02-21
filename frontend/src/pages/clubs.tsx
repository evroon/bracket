import { Grid, Title } from '@mantine/core';

import ClubModal from '../components/modals/club_modal';
import ClubsTable from '../components/tables/clubs';
import { checkForAuthError, getClubs } from '../services/adapter';
import Layout from './_layout';

export default function HomePage() {
  const swrClubsResponse = getClubs();
  checkForAuthError(swrClubsResponse);

  return (
    <Layout>
      <Grid grow>
        <Grid.Col span={9}>
          <Title>Clubs</Title>
        </Grid.Col>
        <Grid.Col span={3}>
          <ClubModal swrClubsResponse={swrClubsResponse} club={null} />
        </Grid.Col>
      </Grid>
      <ClubsTable swrClubsResponse={swrClubsResponse} />
    </Layout>
  );
}
