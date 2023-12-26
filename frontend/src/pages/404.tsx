import { Button, Container, Group, Text, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import classes from './404.module.css';

export default function NotFoundTitle() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <Title className={classes.title}> {t('not_found_title')}</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        {t('not_found_description')}
      </Text>
      <Group justify="center">
        <Button variant="subtle" size="md" onClick={() => router.push('/')}>
          {t('back_home_nav')}
        </Button>
      </Group>
    </Container>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
