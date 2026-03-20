import RequestErrorAlert from '@components/utils/error_alert';
import { Container, Loader, Stack, Title } from '@mantine/core';
import Layout from '@pages/_layout';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminDashboardPage() {
  const { t } = useTranslation();

  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  if (loading) {
    return (
      <Layout>
        <Title order={2}>{t('admin_dashboard_title')}</Title>
        <Container size="lg" py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader size="xl" />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Title order={2}>{t('admin_dashboard_title')}</Title>
      {error && <RequestErrorAlert error={error} />}
      <Stack style={{ maxWidth: '40rem' }}>Placeholder for Admin page</Stack>
    </Layout>
  );
}
