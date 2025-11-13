import { Group, Stack, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import UserForm from '../components/forms/user';
import RequestErrorAlert from '../components/utils/error_alert';
import { TableSkeletonSingleColumn } from '../components/utils/skeletons';
import { checkForAuthError, getUser } from '../services/adapter';
import Layout from './_layout';

export default function UserPage() {
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
      {swrUserResponse.error && <RequestErrorAlert error={swrUserResponse.error} />}
      <Stack style={{ maxWidth: '40rem' }}>{content}</Stack>
    </Layout>
  );
}
