import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';

export function ErrorAlert({ title, message }: { title: string; message: string }) {
  return (
    <Alert icon={<IconAlertCircle size={16} />} title={title} color="red" radius="lg">
      {message}
    </Alert>
  );
}

export default function RequestErrorAlert({ error }: any) {
  const status_code =
    error.response != null && error.response.data.status != null
      ? `Error [${error.response.data.status}]`
      : 'Error';
  const message = `${status_code}: ${error.response ? error.response.data.detail : error.message}`;

  return <ErrorAlert message={message} title="Error" />;
}
