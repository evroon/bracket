import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';

export default function Elimination() {
  return (
    <Alert icon={<IconAlertCircle size={16} />} title="No options" color="blue" radius="lg">
      For elimination, scheduling is handled automatically.
      <br />
      Therefore, no options are available.
    </Alert>
  );
}
