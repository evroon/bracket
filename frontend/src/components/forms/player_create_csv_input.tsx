import { Textarea } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import React from 'react';

export function PlayerCreateCSVInput({ form }: { form: UseFormReturnType<any> }) {
  return (
    <Textarea
      label="Add multiple players. Put every player on a separate line"
      placeholder="Player 1"
      minRows={10}
      {...form.getInputProps('names')}
    />
  );
}
