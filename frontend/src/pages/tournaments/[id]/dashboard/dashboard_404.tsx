import { Container, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import classes from '@404.module.css';

export default function DashboardNotFoundPage() {
  const { t } = useTranslation();

  return (
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <Title className={classes.title}> {t('not_found_title')}</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        {t('not_found_description')}
      </Text>
    </Container>
  );
}
