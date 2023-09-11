import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';

export default function SchedulingPlaceholder() {
  return (
    <Alert icon={<IconAlertCircle size={16} />} title="No options" color="yellow" radius="lg">
      There is no active stage.
    </Alert>
  );
}
