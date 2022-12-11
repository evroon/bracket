import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons';
import React from 'react';

export default function ErrorAlert(error: any) {
  return (
    <Alert icon={<IconAlertCircle size={16} />} title="API error" color="red" radius="lg">
      Error [{error.response.status}]: {error.response.data.detail}
    </Alert>
  );
}
