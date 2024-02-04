import { Grid, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import ClubModal from '../components/modals/club_modal';
import ClubsTable from '../components/tables/clubs';
import { capitalize } from '../components/utils/util';
import { checkForAuthError, getClubs } from '../services/adapter';
import Layout from './_layout';

export default function HomePage() {
  const swrClubsResponse = getClubs();
  const { t } = useTranslation();

  checkForAuthError(swrClubsResponse);

  return (
    <Layout>
      <Grid grow>
        <Grid.Col span={9}>
          <Title>{capitalize(t('clubs_title'))}</Title>
        </Grid.Col>
        <Grid.Col span={3}>
          <ClubModal swrClubsResponse={swrClubsResponse} club={null} />
        </Grid.Col>
      </Grid>
      <ClubsTable swrClubsResponse={swrClubsResponse} />
    </Layout>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
