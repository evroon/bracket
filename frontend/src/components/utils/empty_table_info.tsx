import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

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
