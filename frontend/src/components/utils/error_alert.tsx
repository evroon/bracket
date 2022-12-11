import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons';
import React from 'react';

export default function ErrorAlert(error: any) {
  const status_code = error.response ? ` [${error.response.data.status}]` : '';
  const message = `Error${status_code}: ${
    error.response ? error.response.data.detail : error.message
  }`;

  return (
    <Alert icon={<IconAlertCircle size={16} />} title="API error" color="red" radius="lg">
      {message}
    </Alert>
  );
}
