import { Grid, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import ClubModal from '../components/modals/club_modal';
import ClubsTable from '../components/tables/clubs';
import { capitalize } from '../components/utils/util';
import { checkForAuthError, getClubs } from '../services/adapter';
import Layout from './_layout';
import classes from './index.module.css';

export default function ClubsPage() {
  const swrClubsResponse = getClubs();
  const { t } = useTranslation();

  checkForAuthError(swrClubsResponse);

  return (
    <Layout>
      <Grid justify="space-between">
        <Grid.Col span="auto">
          <Title>{capitalize(t('clubs_title'))}</Title>
        </Grid.Col>
        <Grid.Col span="content" className={classes.fullWithMobile}>
          <ClubModal swrClubsResponse={swrClubsResponse} club={null} />
        </Grid.Col>
      </Grid>
      <ClubsTable swrClubsResponse={swrClubsResponse} />
    </Layout>
  );
}
