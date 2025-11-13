import { Button, Container, Group, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { tokenPresent } from '../services/local_storage';
import classes from './404.module.css';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <Title className={classes.title}> {t('not_found_title')}</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        {t('not_found_description')}
      </Text>
      <Group justify="center">
        <Button
          variant="subtle"
          size="md"
          onClick={() => (tokenPresent() ? navigate('/') : navigate('/login'))}
        >
          {t('back_home_nav')}
        </Button>
      </Group>
    </Container>
  );
}
