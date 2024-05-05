import { Group, Stack, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import UserForm from '../components/forms/user';
import { TableSkeletonSingleColumn } from '../components/utils/skeletons';
import { checkForAuthError, getUser } from '../services/adapter';
import Layout from './_layout';

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default function HomePage() {
  const { t, i18n } = useTranslation();

  const swrUserResponse = getUser();
  checkForAuthError(swrUserResponse);
  const user = swrUserResponse.data != null ? swrUserResponse.data.data : null;

  let content = user != null ? <UserForm user={user} i18n={i18n} t={t} /> : null;

  if (swrUserResponse.isLoading) {
    content = (
      <Group maw="40rem">
        <TableSkeletonSingleColumn />
      </Group>
    );
  }

  return (
    <Layout>
      <Title>{t('edit_profile_title')}</Title>
      <Stack style={{ maxWidth: '40rem' }}>{content}</Stack>
    </Layout>
  );
}
