import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';

export function EmptyTableInfo({
  entity_name,
  message = '',
}: {
  entity_name: string;
  message?: string;
}) {
  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title={`No ${entity_name} found`}
      color="blue"
      radius="lg"
      mt={8}
    >
      Could not find any {entity_name}
      {message}
    </Alert>
  );
}
