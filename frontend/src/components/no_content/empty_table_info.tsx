import { Alert, Container, Group, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { MdOutlineConstruction } from 'react-icons/md';

import classes from './empty_table_info.module.css';

export function EmptyTableInfo({
  entity_name,
  message = '',
}: {
  entity_name: string;
  message?: string;
}) {
  const { t } = useTranslation();
  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title={`No ${entity_name} found`}
      color="blue"
      radius="lg"
      mt={8}
    >
      {t('could_not_find_any_alert')} {entity_name}
      {message}
    </Alert>
  );
}

export function NoContent({ title, description }: { title: string; description?: string }) {
  return (
    <Container>
      <div className={classes.label}>
        <MdOutlineConstruction />
      </div>
      <Title className={classes.title}>{title}</Title>
      <Text size="lg" ta="center" className={classes.description}>
        {description}
      </Text>
      <Group justify="center"></Group>
    </Container>
  );
}
