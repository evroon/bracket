import { Grid, Select, Title } from '@mantine/core';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';

import TournamentsCardTable from '../components/card_tables/tournaments';
import TournamentModal from '../components/modals/tournament_modal';
import { capitalize } from '../components/utils/util';
import { TournamentFilter } from '../interfaces/tournament';
import { checkForAuthError, getTournaments } from '../services/adapter';
import Layout from './_layout';
import classes from './index.module.css';

export default function HomePage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<TournamentFilter>('OPEN');

  const swrTournamentsResponse = getTournaments(filter);
  checkForAuthError(swrTournamentsResponse);

  return (
    <Layout>
      <Grid>
        <Grid.Col span="auto">
          <Title>{capitalize(t('tournaments_title'))}</Title>
        </Grid.Col>
        <Grid.Col span="content" className={classes.fullWithMobile}>
          <Select
            size="md"
            placeholder="Pick value"
            data={[
              { label: 'All', value: 'ALL' },
              { label: 'Archived', value: 'ARCHIVED' },
              { label: 'Open', value: 'OPEN' },
            ]}
            allowDeselect={false}
            value={filter}
            // @ts-ignore
            onChange={(f: TournamentFilter) => setFilter(f)}
          />
        </Grid.Col>
        <Grid.Col span="content" className={classes.fullWithMobile}>
          <TournamentModal swrTournamentsResponse={swrTournamentsResponse} />
        </Grid.Col>
      </Grid>
      <TournamentsCardTable swrTournamentsResponse={swrTournamentsResponse} />
    </Layout>
  );
}

type Props = {};
export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});
