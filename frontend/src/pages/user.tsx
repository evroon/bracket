import { Stack, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import UserForm from '../components/forms/user';
import { checkForAuthError, getTournaments, getUser } from '../services/adapter';
import { getLogin } from '../services/local_storage';
import Layout from './_layout';

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default function HomePage() {
  let user = null;
  const { t } = useTranslation();

  const swrTournamentsResponse = getTournaments();
  checkForAuthError(swrTournamentsResponse);

  if (typeof window !== 'undefined') {
    const swrUserResponse = getUser(getLogin().user_id);
    user = swrUserResponse.data != null ? swrUserResponse.data.data : null;
  }

  const form = user != null ? <UserForm user={user} /> : null;

  return (
    <Layout>
      <Title>{t('edit_profile_title')}</Title>
      <Stack style={{ maxWidth: '400px' }}>{form}</Stack>
    </Layout>
  );
}
