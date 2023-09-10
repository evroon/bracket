import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';

export default function RoundRobin() {
  return (
    <Alert icon={<IconAlertCircle size={16} />} title="No options" color="blue" radius="lg">
      For round robin scheduling, no options are available
    </Alert>
  );
}
