import { Textarea } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import React from 'react';

export function MultiPlayersInput({ form }: { form: UseFormReturnType<any> }) {
  return (
    <Textarea
      label="Add multiple players. Put every player on a separate line"
      placeholder="Player 1"
      minRows={10}
      {...form.getInputProps('names')}
    />
  );
}

export function MultiTeamsInput({ form }: { form: UseFormReturnType<any> }) {
  return (
    <Textarea
      label="Add multiple teams. Put every team on a separate line"
      placeholder="Team 1"
      minRows={10}
      {...form.getInputProps('names')}
    />
  );
}
