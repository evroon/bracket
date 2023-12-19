import { Textarea } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import React from 'react';

const { t } = useTranslation();
export function MultiPlayersInput({ form }: { form: UseFormReturnType<any> }) {
  return (
    <Textarea
      label={t('multiple_players_input_label')}
      placeholder={t('multiple_players_input_placeholder')}
      minRows={10}
      {...form.getInputProps('names')}
    />
  );
}

export function MultiTeamsInput({ form }: { form: UseFormReturnType<any> }) {
  return (
    <Textarea
      label={t('multiple_teams_input_label')}
      placeholder={t('multiple_teams_input_placeholder')}
      minRows={10}
      {...form.getInputProps('names')}
    />
  );
}
